/*
 * Managekaro — native Windows launcher (single-file, offline).
 *
 * The compiled EXE carries the whole web app as an appended archive.
 * On first run it unpacks the app to %LOCALAPPDATA%\Managekaro\app-1.0.0,
 * serves it from a tiny local HTTP server on 127.0.0.1 and opens the
 * default browser. No install, no admin rights, no dependencies.
 *
 * Build:  zig cc -target x86_64-windows-gnu launcher.c -o Managekaro-Setup-1.0.0.exe -lws2_32 -lshell32
 */
#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <shellapi.h>
#include <shlobj.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define APP_NAME    "Managekaro"
#define APP_VERSION "1.0.0"
#define TRAILER     8 /* 4-byte magic + 4-byte archive size */
#define MAX_PATH_LEN 1024

static char g_root[MAX_PATH_LEN];      /* extraction root, e.g. ...\Managekaro\app-1.0.0 */
static char g_url[256];
static int  g_port = 0;

/* ------------------------------- helpers ---------------------------------- */

static void die(const char *msg) {
    printf("\n  [x] %s\n\n  Press ENTER to close.\n", msg);
    getchar();
    exit(1);
}

static unsigned int rd_u32(const unsigned char *p) {
    return (unsigned int)p[0] | ((unsigned int)p[1] << 8) | ((unsigned int)p[2] << 16) | ((unsigned int)p[3] << 24);
}

static void mkdir_p(const char *path) {
    char tmp[MAX_PATH_LEN];
    snprintf(tmp, sizeof(tmp), "%s", path);
    for (char *p = tmp + 3; *p; p++) {
        if (*p == '\\' || *p == '/') {
            char keep = *p;
            *p = 0;
            CreateDirectoryA(tmp, NULL);
            *p = keep;
        }
    }
    CreateDirectoryA(tmp, NULL);
}

/* --------------------------- archive extraction --------------------------- */

static int read_whole_file(const char *path, unsigned char **out, long *size) {
    HANDLE h = CreateFileA(path, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (h == INVALID_HANDLE_VALUE) return 0;
    LARGE_INTEGER li;
    if (!GetFileSizeEx(h, &li)) { CloseHandle(h); return 0; }
    long n = (long)li.QuadPart;
    unsigned char *buf = (unsigned char *)malloc((size_t)n);
    if (!buf) { CloseHandle(h); return 0; }
    DWORD read = 0;
    BOOL ok = ReadFile(h, buf, (DWORD)n, &read, NULL);
    CloseHandle(h);
    if (!ok) { free(buf); return 0; }
    *out = buf; *size = n;
    return 1;
}

static long find_archive(const unsigned char *data, long size) {
    if (size < TRAILER + 4) return -1;
    const unsigned char *t = data + size - TRAILER;
    if (!(t[0] == 'M' && t[1] == 'K' && t[2] == 'A' && t[3] == 'P')) return -1;
    unsigned int alen = rd_u32(t + 4);
    if ((long)alen + TRAILER > size) return -1;
    return size - (long)alen - TRAILER;
}

static int extract_app(const char *exe_path) {
    unsigned char *data = NULL;
    long size = 0;
    if (!read_whole_file(exe_path, &data, &size)) { printf("  [!] cannot read executable\n"); return 0; }
    long off = find_archive(data, size);
    if (off < 0) { printf("  [!] this build has no embedded app archive\n"); free(data); return 0; }

    mkdir_p(g_root);
    char marker[MAX_PATH_LEN];
    snprintf(marker, sizeof(marker), "%s\\version.txt", g_root);
    /* re-create only when version differs */
    FILE *mf = fopen(marker, "rb");
    if (mf) {
        char buf[64] = {0};
        size_t got = fread(buf, 1, sizeof(buf) - 1, mf);
        fclose(mf);
        if (got && strstr(buf, APP_VERSION)) { free(data); return 1; }
    }

    long p = off;
    long end = size - TRAILER;
    int files = 0;
    while (p + 8 <= end) {
        unsigned int nlen = rd_u32(data + p); p += 4;
        unsigned int dlen = rd_u32(data + p); p += 4;
        if (p + (long)nlen + (long)dlen > end || nlen > 512) break;
        char rel[512];
        memcpy(rel, data + p, nlen); rel[nlen] = 0; p += nlen;
        for (unsigned int i = 0; i < nlen; i++) if (rel[i] == '/') rel[i] = '\\';

        char full[MAX_PATH_LEN];
        snprintf(full, sizeof(full), "%s\\%s", g_root, rel);
        /* make parent folders */
        char parent[MAX_PATH_LEN];
        snprintf(parent, sizeof(parent), "%s", full);
        char *slash = strrchr(parent, '\\');
        if (slash) { *slash = 0; mkdir_p(parent); }

        HANDLE h = CreateFileA(full, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
        if (h != INVALID_HANDLE_VALUE) {
            DWORD wrote = 0;
            WriteFile(h, data + p, (DWORD)dlen, &wrote, NULL);
            CloseHandle(h);
            files++;
        }
        p += dlen;
    }

    FILE *out = fopen(marker, "wb");
    if (out) { fprintf(out, APP_VERSION "\n"); fclose(out); }
    free(data);
    printf("  [ok] unpacked %d files to %s\n", files, g_root);
    return 1;
}

/* ------------------------------- http server ------------------------------- */

static const char *mime_for(const char *path) {
    const char *dot = strrchr(path, '.');
    if (!dot) return "application/octet-stream";
    if (!_stricmp(dot, ".html") || !_stricmp(dot, ".htm")) return "text/html; charset=utf-8";
    if (!_stricmp(dot, ".js"))   return "text/javascript; charset=utf-8";
    if (!_stricmp(dot, ".css"))  return "text/css; charset=utf-8";
    if (!_stricmp(dot, ".json")) return "application/json; charset=utf-8";
    if (!_stricmp(dot, ".webmanifest")) return "application/manifest+json; charset=utf-8";
    if (!_stricmp(dot, ".svg"))  return "image/svg+xml";
    if (!_stricmp(dot, ".png"))  return "image/png";
    if (!_stricmp(dot, ".jpg") || !_stricmp(dot, ".jpeg")) return "image/jpeg";
    if (!_stricmp(dot, ".ico"))  return "image/x-icon";
    if (!_stricmp(dot, ".woff2")) return "font/woff2";
    if (!_stricmp(dot, ".woff")) return "font/woff";
    if (!_stricmp(dot, ".txt"))  return "text/plain; charset=utf-8";
    if (!_stricmp(dot, ".csv"))  return "text/csv; charset=utf-8";
    if (!_stricmp(dot, ".exe"))  return "application/vnd.microsoft.portable-executable";
    if (!_stricmp(dot, ".pdf"))  return "application/pdf";
    return "application/octet-stream";
}

static int file_exists(const char *p) {
    DWORD a = GetFileAttributesA(p);
    return a != INVALID_FILE_ATTRIBUTES && !(a & FILE_ATTRIBUTE_DIRECTORY);
}

static DWORD WINAPI handle_client(LPVOID arg) {
    SOCKET c = (SOCKET)(intptr_t)arg;
    char req[4096];
    int got = recv(c, req, sizeof(req) - 1, 0);
    if (got <= 0) { closesocket(c); return 0; }
    req[got] = 0;

    char method[8] = {0}, raw[1024] = {0};
    if (sscanf(req, "%7s %1023s", method, raw) != 2) { closesocket(c); return 0; }

    char *q = strchr(raw, '?');
    if (q) *q = 0;
    char path[MAX_PATH_LEN];
    snprintf(path, sizeof(path), "%s", raw);
    if (path[0] != '/') snprintf(path, sizeof(path), "/%s", raw);

    /* clean URLs handled by the SPA */
    const char *clean[] = { "/", "/app", "/download", "/login", "/docs", "/pricing", "/product", "/solutions" };
    int toIndex = 0;
    for (unsigned i = 0; i < sizeof(clean) / sizeof(clean[0]); i++)
        if (!strcmp(path, clean[i])) toIndex = 1;
    if (!toIndex && !strchr(path, '.')) toIndex = 1;

    char full[MAX_PATH_LEN * 2];
    if (toIndex) snprintf(full, sizeof(full), "%s\\index.html", g_root);
    else {
        for (char *p = path; *p; p++) if (*p == '/') *p = '\\';
        snprintf(full, sizeof(full), "%s\\%s", g_root, path + 1);
    }

    if (!file_exists(full)) {
        const char *body = "<!doctype html><meta charset=utf-8><title>Not found</title>"
                           "<body style=\"font-family:system-ui;padding:48px\"><h1>404</h1>"
                           "<p>This file is not part of the Managekaro app.</p>";
        char head[512];
        int hl = snprintf(head, sizeof(head),
                          "HTTP/1.1 404 Not Found\r\nContent-Type: text/html; charset=utf-8\r\n"
                          "Content-Length: %u\r\nConnection: close\r\n\r\n", (unsigned)strlen(body));
        send(c, head, hl, 0);
        send(c, body, (int)strlen(body), 0);
        closesocket(c);
        return 0;
    }

    unsigned char *data = NULL;
    long size = 0;
    if (!read_whole_file(full, &data, &size)) {
        const char *e = "HTTP/1.1 500 Internal Server Error\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
        send(c, e, (int)strlen(e), 0);
        closesocket(c);
        return 0;
    }

    char head[768];
    int hl = snprintf(head, sizeof(head),
                      "HTTP/1.1 200 OK\r\nContent-Type: %s\r\nContent-Length: %ld\r\n"
                      "Cache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n",
                      mime_for(full), size);
    send(c, head, hl, 0);
    long sent = 0;
    while (sent < size) {
        int n = send(c, (const char *)data + sent, (int)((size - sent) > 65536 ? 65536 : (size - sent)), 0);
        if (n <= 0) break;
        sent += n;
    }
    free(data);
    closesocket(c);
    return 0;
}

static SOCKET start_server(void) {
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) return INVALID_SOCKET;
    for (int port = 47321; port < 47400; port++) {
        SOCKET s = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (s == INVALID_SOCKET) return INVALID_SOCKET;
        struct sockaddr_in a;
        memset(&a, 0, sizeof(a));
        a.sin_family = AF_INET;
        a.sin_port = htons((u_short)port);
        a.sin_addr.s_addr = inet_addr("127.0.0.1");
        if (bind(s, (struct sockaddr *)&a, sizeof(a)) == 0 && listen(s, 32) == 0) {
            g_port = port;
            snprintf(g_url, sizeof(g_url), "http://127.0.0.1:%d/app", port);
            return s;
        }
        closesocket(s);
    }
    return INVALID_SOCKET;
}

/* ---------------------------------- main ---------------------------------- */

int main(void) {
    char exe[MAX_PATH_LEN];
    if (!GetModuleFileNameA(NULL, exe, MAX_PATH_LEN)) die("cannot locate the executable");

    char local[MAX_PATH_LEN];
    if (SHGetFolderPathA(NULL, CSIDL_LOCAL_APPDATA, NULL, 0, local) != S_OK) die("cannot locate your AppData folder");
    snprintf(g_root, sizeof(g_root), "%s\\Managekaro\\app-" APP_VERSION, local);

    printf("\n  ==================================================\n");
    printf("   Managekaro  |  ERP + HRM for fit-out & construction\n");
    printf("   Desktop edition v" APP_VERSION " (64-bit Windows)\n");
    printf("  ==================================================\n\n");
    printf("  Starting local engine...\n");

    extract_app(exe);

    SOCKET srv = start_server();
    if (srv == INVALID_SOCKET) die("could not start the local web server (is a firewall blocking localhost?)");

    printf("  [ok] serving on %s\n", g_url);
    printf("  [ok] opening your browser...\n\n");
    printf("  Keep this window open while you work.\n");
    printf("  Close it (or press CTRL+C) to stop Managekaro.\n\n");

    ShellExecuteA(NULL, "open", g_url, NULL, NULL, SW_SHOWNORMAL);

    for (;;) {
        SOCKET c = accept(srv, NULL, NULL);
        if (c == INVALID_SOCKET) continue;
        HANDLE t = CreateThread(NULL, 0, handle_client, (LPVOID)(intptr_t)c, 0, NULL);
        if (t) CloseHandle(t);
        else { closesocket(c); }
    }
    return 0;
}

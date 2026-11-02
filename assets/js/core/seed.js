/* Managekaro — master data + deterministic demo dataset (interior fit-out & construction ERP) */
(function (MK) {
  'use strict';
  const U = MK.U, S = {};

  /* ============================ master constants ========================= */
  const NAMES = ['Aarav Sharma', 'Vivaan Mehta', 'Aditya Rao', 'Kabir Nair', 'Rahul Verma', 'Siddharth Iyer', 'Arjun Kapoor', 'Rohan Bhatia', 'Karan Malhotra', 'Dhruv Sethi',
    'Ananya Menon', 'Isha Gupta', 'Priya Desai', 'Sneha Kulkarni', 'Meera Joshi', 'Nisha Reddy', 'Kavya Pillai', 'Divya Chauhan', 'Ritika Jain', 'Aisha Khan',
    'Ramesh Yadav', 'Suresh Patil', 'Mahesh Kumar', 'Vijay Singh', 'Anil Thakur', 'Deepak Mishra', 'Rajesh Pandey', 'Manoj Tiwari', 'Ashok Chavan', 'Sunil Das',
    'Farhan Ali', 'Imran Sheikh', 'Imtiaz Ansari', 'Zoya Farooqui', 'Neha Bansal', 'Pooja Saxena', 'Simran Kaur', 'Harleen Gill', 'Tanya Bose', 'Shreya Ghosh',
    'Nikhil Chandra', 'Varun Nayak', 'Gaurav Bhatt', 'Vikram Shetty', 'Pranav Hegde', 'Sameer Qureshi', 'Aman Rathore', 'Yash Agarwal', 'Ritu Solanki', 'Bhavna Rawat',
    'Naveen Pillai', 'Kiran George', 'Joel Mathew', 'Anand Kamath', 'Sagar Pawar', 'Omkar Sable', 'Tejas Wagh', 'Abhijit Sen'];
  const DEPTS = [
    { id: 'd1', name: 'Projects & Delivery', color: '#F2540B' },
    { id: 'd2', name: 'Design & Studio', color: '#7C3AED' },
    { id: 'd3', name: 'Procurement', color: '#2563EB' },
    { id: 'd4', name: 'Finance & Accounts', color: '#0E9F6E' },
    { id: 'd5', name: 'Human Resources', color: '#0D9488' },
    { id: 'd6', name: 'Sales & CRM', color: '#DB2777' },
    { id: 'd7', name: 'Site Operations', color: '#D97706' },
    { id: 'd8', name: 'Quality & Safety (QHSE)', color: '#DC2626' },
    { id: 'd9', name: 'Stores & Logistics', color: '#4B5563' },
    { id: 'd10', name: 'IT & Systems', color: '#0891B2' }
  ];
  const DESIGNS = ['Managing Director', 'Director – Projects', 'Head of Design', 'Head of Procurement', 'Finance Controller', 'HR Manager', 'Project Manager', 'Senior Project Manager',
    'Site Engineer', 'Site Supervisor', 'Quantity Surveyor', 'Designer', '3D Visualiser', 'Procurement Executive', 'Store Keeper', 'Accounts Executive', 'Safety Officer',
    'Quality Inspector', 'Sales Manager', 'Business Development Executive', 'HR Executive', 'Admin Executive', 'MEP Engineer', 'Draughtsman', 'Foreman', 'Operations Head'];
  const ROLES = [
    { id: 'owner', name: 'Owner / Director', scope: 'All modules, billing, approvals', color: 'brand', perms: ['*'] },
    { id: 'admin', name: 'System Admin', scope: 'Users, masters, integrations', color: 'purple', perms: ['settings', 'users', 'masters', 'all-read'] },
    { id: 'pm', name: 'Project Manager', scope: 'Own projects: BOQ, schedule, site, snags', color: 'info', perms: ['project:*', 'boq:*', 'tasks:*', 'dpr:*', 'snag:*', 'doc:*'] },
    { id: 'site', name: 'Site Engineer', scope: 'DPR, progress, material receipt, quality', color: 'teal', perms: ['dpr:*', 'progress:*', 'grn:*', 'snag:*'] },
    { id: 'design', name: 'Designer', scope: 'Drawings, revisions, approvals', color: 'purple', perms: ['doc:*', 'design:*'] },
    { id: 'proc', name: 'Procurement', scope: 'PR, RFQ, PO, vendor master', color: 'info', perms: ['pr:*', 'po:*', 'vendor:*', 'grn:*'] },
    { id: 'fin', name: 'Finance', scope: 'Invoices, payments, billing, P&L', color: 'ok', perms: ['invoice:*', 'payment:*', 'billing:*', 'finance:read'] },
    { id: 'hr', name: 'HR', scope: 'People, attendance, payroll, hiring', color: 'teal', perms: ['hr:*'] },
    { id: 'qs', name: 'Quantity Surveyor', scope: 'BOQ, measurement, change orders', color: 'warn', perms: ['boq:*', 'mb:*', 'co:*'] },
    { id: 'client', name: 'Client Portal', scope: 'Read-only progress, approvals, snags', color: 'grey', perms: ['portal:read', 'approval:own'] },
    { id: 'vendor', name: 'Vendor Portal', scope: 'POs, delivery, invoices', color: 'grey', perms: ['vendorportal'] },
    { id: 'auditor', name: 'Auditor (read-only)', scope: 'Read all, export', color: 'grey', perms: ['*:read'] }
  ];
  const UNITS = ['sqft', 'sqm', 'rft', 'rmt', 'nos', 'set', 'ltr', 'kg', 'bag', 'cum', 'bundle', 'pair', 'point', 'coil', 'sheet', 'job'];

  const ITEMS = [
    // trade, code, name, unit, rate, brand
    ['Civil', 'CIV-GYP-12', 'Gypsum board partition 12.5mm (both side, 50mm stud)', 'sqft', 168, 'Saint-Gobain'],
    ['Civil', 'CIV-GYP-CL', 'Gypsum ceiling with GI framing & 2 coats putty', 'sqft', 132, 'Saint-Gobain'],
    ['Civil', 'CIV-CEM-OPC', 'OPC 53 grade cement', 'bag', 420, 'UltraTech'],
    ['Civil', 'CIV-RMC-M25', 'RMC M25 design mix', 'cum', 6250, 'ACC'],
    ['Civil', 'CIV-BRK-01', 'AAC block 200mm', 'nos', 92, 'Biltech'],
    ['Civil', 'CIV-PLA-POP', 'Wall putty / POP punning 2 coats', 'sqft', 34, 'Birla White'],
    ['Flooring', 'FLR-VTL-600', 'Vitrified tile 600x600 anti-skid', 'sqft', 96, 'Kajaria'],
    ['Flooring', 'FLR-VNL-01', 'Vinyl flooring 2mm heterogeneous', 'sqft', 148, 'Gerflor'],
    ['Flooring', 'FLR-CPT-TL', 'Carpet tile 50x50 loop pile', 'sqft', 165, 'Interface'],
    ['Flooring', 'FLR-GRN-01', 'Granite 18mm mirror polished', 'sqft', 285, 'RK Marbles'],
    ['Flooring', 'FLR-EPX-3M', 'Epoxy self-levelling 3mm', 'sqft', 88, 'Sika'],
    ['Painting', 'PNT-EML-PR', 'Acrylic emulsion premium (2 coats + primer)', 'sqft', 28, 'Asian Paints'],
    ['Painting', 'PNT-PUT-01', 'Wall putty 2 coats with sanding', 'sqft', 22, 'Birla White'],
    ['Painting', 'PNT-TXT-01', 'Texture paint finish', 'sqft', 58, 'Nerolac'],
    ['Painting', 'PNT-MEL-01', 'Melamine polish on veneer', 'sqft', 92, 'Asian Paints'],
    ['Carpentry', 'CAR-MDF-WD', 'Modular workstations (MDF + laminate) 1200x600', 'nos', 12800, 'Godrej'],
    ['Carpentry', 'CAR-VNR-DR', 'Flush door with veneer finish 900x2100', 'nos', 14500, 'Greenply'],
    ['Carpentry', 'CAR-PLY-19', 'BWP plywood 19mm', 'sqft', 96, 'Century'],
    ['Carpentry', 'CAR-LAM-01', 'Laminate 1mm (std grade)', 'sqft', 88, 'Merino'],
    ['Carpentry', 'CAR-CAB-MD', 'Pantry cabinetry with SS 304 top', 'rft', 4850, 'Custom'],
    ['Carpentry', 'CAR-CHAIR-01', 'Task chair mesh back, nylon base', 'nos', 6200, 'Featherlite'],
    ['MEP', 'MEP-CU-PIPE', 'Copper pipe 15mm for FCU / VRV', 'rmt', 640, 'Astral'],
    ['MEP', 'MEP-VRV-IDU', 'VRV indoor unit 2.0 TR cassette', 'nos', 42000, 'Daikin'],
    ['MEP', 'MEP-VRV-ODU', 'VRV outdoor unit 16 HP', 'nos', 1450000, 'Daikin'],
    ['MEP', 'MEP-DUCT-GI', 'GI ducting 24G with insulation', 'sqft', 138, 'Custom'],
    ['MEP', 'MEP-AC-GRILL', 'Aluminium supply air diffuser 600x600', 'nos', 1850, 'Airolex'],
    ['Electrical', 'ELE-WIR-25', 'FR wire 2.5 sqmm single core', 'coil', 2150, 'Havells'],
    ['Electrical', 'ELE-LGT-PNL', 'LED panel light 36W 600x600', 'nos', 1250, 'Philips'],
    ['Electrical', 'ELE-LGT-LIN', 'LED linear profile 20W/m', 'rmt', 980, 'Wipro'],
    ['Electrical', 'ELE-SWBD-01', 'LT distribution board 8 way', 'nos', 14500, 'Schneider'],
    ['Electrical', 'ELE-SOCK-01', 'Modular socket 6/16A with plate', 'point', 680, 'Legrand'],
    ['Electrical', 'ELE-CT-01', 'Cable tray 300mm GI perforated', 'rmt', 720, 'Custom'],
    ['Plumbing', 'PLM-CP-PIPE', 'CPVC pipe 25mm (SDR 11)', 'rmt', 245, 'Astral'],
    ['Plumbing', 'PLM-WC-01', 'Wall hung WC with concealed cistern', 'nos', 21400, 'Jaquar'],
    ['Plumbing', 'PLM-WB-01', 'Wash basin with CP fittings', 'nos', 12800, 'Kohler'],
    ['Plumbing', 'PLM-TAP-SS', 'SS sink with drain board', 'nos', 8600, 'Nirali'],
    ['Fire', 'FIRE-SPR-01', 'Sprinkler head 68°C pendent', 'nos', 950, 'Tyco'],
    ['Fire', 'FIRE-PIPE-50', 'MS ERW pipe 50mm for hydrant', 'rmt', 480, 'Jindal'],
    ['Fire', 'FIRE-EXT-01', 'Fire extinguisher ABC 6kg', 'nos', 2450, 'Ceasefire'],
    ['Fire', 'FIRE-ALM-01', 'Addressable smoke detector', 'nos', 3200, 'Honeywell'],
    ['Glass', 'GLS-PART-12', 'Toughened glass partition 12mm', 'sqft', 385, 'Saint-Gobain'],
    ['Glass', 'GLS-BAL-01', 'Balustrade with SS 304 handrail', 'rft', 2850, 'Custom'],
    ['Interior', 'INT-RCP-MIC', 'Stretch/micro ceiling in washroom', 'sqft', 175, 'Custom'],
    ['Interior', 'INT-SIG-01', 'Acrylic signage with LED backlit', 'nos', 34500, 'Custom'],
    ['Interior', 'INT-BLND-01', 'Roller blind with motorised option', 'sqft', 168, 'Mac'],
    ['Interior', 'INT-SOFA-01', 'Lounge sofa 3-seater upholstered', 'nos', 42000, 'Custom'],
    ['HVAC Service', 'SVC-AC-SRV', 'AC servicing & gas top-up per unit', 'nos', 1850, 'In-house'],
    ['Labour', 'LAB-CIV-DAY', 'Civil skilled labour', 'nos', 850, 'In-house'],
    ['Labour', 'LAB-CRP-DAY', 'Carpenter skilled labour', 'nos', 950, 'In-house'],
    ['Labour', 'LAB-ELC-DAY', 'Electrician skilled labour', 'nos', 900, 'In-house'],
    ['Labour', 'LAB-HLP-DAY', 'Helper / unskilled labour', 'nos', 620, 'In-house'],
    ['Misc', 'MIS-HK-01', 'Site housekeeping & debris removal', 'job', 12500, 'Custom'],
    ['Misc', 'MIS-SCFF-01', 'Scaffolding rental (per sqm per month)', 'sqm', 145, 'Custom'],
    ['Misc', 'MIS-PROT-01', 'Floor & facade protection sheets', 'sqft', 12, 'Custom']
  ];
  const VENDORS = [
    ['Vikram Enterprises', 'Civil & Blocks', 'Gurugram', 'Vikram Sethi'],
    ['Shree Balaji Traders', 'Building Material', 'Delhi', 'Balaji Prasad'],
    ['Asian Interiors Works', 'Carpentry & Joinery', 'Noida', 'Sunil Arora'],
    ['Cool Air Systems', 'HVAC & VRV', 'Gurugram', 'Rakesh Bhatia'],
    ['Volt Electricals', 'Electrical & LT', 'Faridabad', 'Naveen Gupta'],
    ['Aqua Flow Plumbing', 'Plumbing & Sanitary', 'Delhi', 'Imran Sheikh'],
    ['Fire Safe Engineers', 'Firefighting', 'Noida', 'Dinesh Rawat'],
    ['Glass Tech India', 'Glass & Aluminium', 'Manesar', 'Pankaj Yadav'],
    ['Paint House India', 'Paints & Finishes', 'Gurugram', 'Ashok Verma'],
    ['Tile Mart', 'Tiles & Stone', 'Kota', 'Mahesh Jain'],
    ['Furniture Craft', 'Furniture & Fixtures', 'Mumbai', 'Sanjay Patil'],
    ['Lighting Studio', 'Lighting', 'Delhi', 'Rohit Anand'],
    ['Secure Access', 'Access Control & CCTV', 'Gurugram', 'Tarun Kapoor'],
    ['Green Scape', 'Landscaping', 'Faridabad', 'Neeraj Rana'],
    ['Perfect Ceiling Co.', 'False Ceiling', 'Noida', 'Vikas Chauhan'],
    ['Steel Structure Co.', 'Structural Steel', 'Ghaziabad', 'Anil Singh'],
    ['Signage Works', 'Signage & Branding', 'Delhi', 'Deepak Kumar'],
    ['Clean Pro Facility', 'Housekeeping', 'Gurugram', 'Ritu Bansal'],
    ['Godrej Interio Dealer', 'Furniture OEM', 'Mumbai', 'Saurabh Joshi'],
    ['Saint Gobain Channel', 'Gypsum & Glass', 'Gurugram', 'Amit Nair'],
    ['Kajaria Gallery', 'Tiles', 'Delhi', 'Rajiv Sharma'],
    ['Daikin Authorised', 'VRV & Ducting', 'Gurugram', 'Mohan Lal'],
    ['Havells Distributor', 'Wires & Switches', 'Noida', 'Pradeep Sinha'],
    ['Jaquar Bath Studio', 'Bath Fittings', 'Delhi', 'Kunal Mehta'],
    ['Quick Logistics', 'Transport', 'Gurugram', 'Suresh Yadav'],
    ['Manpower Hub', 'Contract Labour', 'Faridabad', 'Ram Niwas'],
    ['Fire Safety NOC', 'Compliance & Liaison', 'Delhi', 'Ajay Tomar'],
    ['Acoustic Solutions', 'Acoustics & Partitions', 'Noida', 'Shalini Roy']
  ];
  const CLIENTS = [
    ['Amazon Development Centre', 'Corporate', 'Bengaluru'], ['Concentrix Corporation', 'IT / BPO', 'Gurugram'],
    ['ICICI Home Finance', 'BFSI', 'Mumbai'], ['The Executive Centre', 'Coworking', 'Gurugram'],
    ['Livspace Experience Studio', 'Retail', 'Bengaluru'], ['Cafe Mocha Retail', 'F&B', 'Delhi'],
    ['JSW Homes HQ', 'Corporate', 'Mumbai'], ['Semac Consultants', 'Consulting', 'Hyderabad'],
    ['Olive Tree Hospitality', 'Hospitality', 'Goa'], ['MedCare Hospitals', 'Healthcare', 'Gurugram'],
    ['Nexus Mall Management', 'Retail', 'Pune'], ['Bright Future School', 'Education', 'Noida'],
    ['Urban Nest Residences', 'Real Estate', 'Gurugram'], ['TechNova Systems', 'IT / BPO', 'Noida'],
    ['DHL Supply Chain', 'Logistics', 'Gurugram'], ['Bata Flagship Store', 'Retail', 'Mumbai'],
    ['Sodexo India', 'Facility', 'Gurugram'], ['HDFC Securities', 'BFSI', 'Mumbai']
  ];

  const TRADES = ['Civil', 'Carpentry', 'False Ceiling', 'Flooring', 'Painting', 'Electrical', 'Plumbing', 'HVAC', 'Fire Fighting', 'Glass & Aluminium', 'Furniture', 'Signage', 'Housekeeping', 'Snagging'];
  const PROJECT_TYPES = ['Corporate Fitout', 'Retail Fitout', 'F&B Fitout', 'Healthcare Fitout', 'Hospitality Fitout', 'Residential Construction', 'Commercial Construction', 'Industrial', 'Coworking'];
  const TAG_DEFS = [
    { name: 'Dependencies', color: 'info' }, { name: 'Client Delay', color: 'bad' }, { name: 'Design Change', color: 'purple' },
    { name: 'Procurement Delay', color: 'warn' }, { name: 'Site Blocker', color: 'bad' }, { name: 'Approval Pending', color: 'warn' },
    { name: 'Variation', color: 'brand' }, { name: 'Quality', color: 'teal' }, { name: 'Safety', color: 'bad' }
  ];

  S.const = { NAMES, DEPTS, DESIGNS, ROLES, UNITS, ITEMS, VENDORS, CLIENTS, TRADES, PROJECT_TYPES, TAG_DEFS };

  /* ============================== generation ============================= */
  S.build = function () {
    const r = U.rng(20260117);
    const today = U.today();
    const db = { meta: { version: 15, generatedAt: new Date().toISOString() } };
    const id = (g, i) => g + '-' + String(i).padStart(4, '0');

    db.org = {
      name: 'Managekaro Spaces Pvt. Ltd.', legal: 'Managekaro Spaces Private Limited', short: 'MS',
      gst: '06AABCM1234K1ZP', pan: 'AABCM1234K', cin: 'U45200HR2019PTC082114',
      address: 'Unit 712, Tower B, Emaar Digital Greens, Golf Course Ext. Road, Sector 61, Gurugram 122102',
      city: 'Gurugram', state: 'Haryana', pin: '122102', country: 'India',
      phone: '+91 124 480 9100', email: 'hello@managekaro.com', web: 'www.managekaro.com',
      gstState: 'HR', currency: 'INR', fiscalStart: 'April', fy: U.fyLabel(today),
      logoText: 'Managekaro', tagline: 'Interior Fit-out & Construction ERP + HRM',
      workWeek: 'Mon – Sat', shift: '09:30 – 18:30', leavePolicy: '18 EL + 12 SL + 10 CL',
      bank: { name: 'HDFC Bank', branch: 'Sector 56, Gurugram', ac: '50200041234567', ifsc: 'HDFC0001234' }
    };
    db.units = [
      { id: 'u1', name: 'Gurugram HQ + Studio', code: 'GGN', city: 'Gurugram', state: 'Haryana', pincode: '122102', gst: '06AABCM1234K1ZP', type: 'Head Office', head: 'Aarav Sharma', seats: 84, phone: '+91 124 480 9100', active: true },
      { id: 'u2', name: 'Mumbai Branch', code: 'MUM', city: 'Mumbai', state: 'Maharashtra', pincode: '400072', gst: '27AABCM1234K1Z8', type: 'Branch', head: 'Priya Desai', seats: 32, phone: '+91 22 4890 2211', active: true },
      { id: 'u3', name: 'Bengaluru Branch', code: 'BLR', city: 'Bengaluru', state: 'Karnataka', pincode: '560103', gst: '29AABCM1234K1Z6', type: 'Branch', head: 'Kiran George', seats: 26, phone: '+91 80 4711 8820', active: true },
      { id: 'u4', name: 'Noida Delivery Centre', code: 'NOI', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', gst: '09AABCM1234K1Z2', type: 'Delivery / Workshop', head: 'Sunil Das', seats: 18, phone: '+91 120 4456 700', active: true },
      { id: 'u5', name: 'Dubai Rep. Office', code: 'DXB', city: 'Dubai', state: 'Dubai', pincode: '00000', gst: 'NA', type: 'International', head: 'Farhan Ali', seats: 8, phone: '+971 4 555 1200', active: false }
    ];
    db.departments = DEPTS;
    db.roles = ROLES;
    db.tags = TAG_DEFS;

    /* ----------------------------- people ------------------------------ */
    const users = [], employees = [];
    NAMES.forEach((nm, i) => {
      const dep = DEPTS[i % DEPTS.length];
      const desig = DESIGNS[i % DESIGNS.length];
      const roleId = i === 0 ? 'owner' : i === 1 ? 'admin' : /Head|Director|Manager$/.test(desig) ? (dep.id === 'd4' ? 'fin' : dep.id === 'd5' ? 'hr' : dep.id === 'd3' ? 'proc' : 'pm')
        : /HR/.test(desig) ? 'hr' : /Accounts|Finance/.test(desig) ? 'fin' : /Procurement/.test(desig) ? 'proc' : /Engineer|Supervisor|Foreman/.test(desig) ? 'site'
          : /Designer|Visualiser|Draughtsman/.test(desig) ? 'design' : /QS|Quantity/.test(desig) ? 'qs' : /Sales|Business/.test(desig) ? 'pm' : 'site';
      const uid = id('USR', i + 1), eid = id('EMP', i + 1);
      const email = (nm.split(' ')[0] + '.' + nm.split(' ')[1]).toLowerCase() + '@managekaro.com';
      const join = U.iso(U.addD('2024-05-06', 0)) ? U.iso(new Date(2018 + (i % 6), (i * 3) % 12, 2 + (i % 26))) : '';
      const unit = db.units[i % 4].id;
      const u = {
        id: uid, empId: eid, name: nm, email, phone: '+91 ' + r.int(70, 99) + ' ' + r.int(10000, 99999) + ' ' + r.int(10000, 99999),
        roleId, deptId: dep.id, designation: desig, unitId: unit, status: 'Active', avatar: U.initials(nm),
        lastLogin: U.iso(U.addD(today, -r.int(0, 22))), active: true, managerId: null, portal: roleId === 'owner' ? 'admin' : 'internal'
      };
      users.push(u);
      employees.push({
        id: eid, userId: uid, name: nm, email, phone: u.phone, deptId: dep.id, designation: desig, roleId,
        unitId: unit, type: i % 9 === 0 ? 'Contract' : 'Full-time', grade: r.pick(['L1', 'L2', 'L3', 'L4', 'M1', 'M2']),
        doj: join, dob: U.iso(new Date(1985 + (i % 15), (i * 5) % 12, 3 + (i % 24))),
        gross: [28000, 42000, 56000, 72000, 95000, 125000, 165000, 220000, 310000][i % 9] + (i % 5) * 1500,
        status: i === 11 || i === 34 ? 'Notice Period' : i === 47 ? 'Resigned' : 'Active',
        pan: 'A' + r.pick(['B', 'C', 'K', 'P']) + 'CP' + r.int(1000, 9999) + r.pick(['A', 'B', 'F', 'Z']),
        aadhaar: 'XXXX-XXXX-' + r.int(1000, 9999), uan: '10' + r.int(10000000000, 99999999999),
        esi: r.chance(.6) ? '77' + r.int(10000000, 99999999) : '', bank: r.pick(['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak']),
        ac: String(r.int(10000000000, 99999999999)), ifsc: r.pick(['HDFC0001234', 'ICIC0000456', 'SBIN0007891', 'UTIB0000123']),
        bloodGroup: r.pick(['O+', 'A+', 'B+', 'AB+', 'O-', 'A-']), gender: /^(Ananya|Isha|Priya|Sneha|Meera|Nisha|Kavya|Divya|Ritika|Aisha|Zoya|Neha|Pooja|Simran|Harleen|Tanya|Shreya|Ritu|Bhavna|Shalini)/.test(nm) ? 'Female' : 'Male',
        emergency: '+91 98' + r.int(100000000, 999999999), address: r.pick(['Sector 45, Gurugram', 'Indirapuram, Ghaziabad', 'Malviya Nagar, Delhi', 'HSR Layout, Bengaluru', 'Andheri East, Mumbai', 'Sector 62, Noida']),
        skills: r.some(['AutoCAD', 'Revit', 'MS Project', 'Primavera P6', 'Excel', 'BOQ', 'SketchUp', 'Site Coordination', 'MEP', 'Vendor Negotiation', 'Labour Management', 'Tally', 'GST', 'Payroll'], r.int(3, 5)),
        manager: '', leaveBal: { EL: r.int(4, 16), SL: r.int(2, 10), CL: r.int(1, 8) },
        ctc: 0, shift: 'General (09:30-18:30)'
      });
    });
    employees.forEach(e => { e.ctc = e.gross * 12; });
    users[0].managerId = null;
    db.users = users; db.employees = employees;
    const empByRole = (role) => employees.filter(e => e.roleId === role);
    const pmPool = employees.filter(e => ['Project Manager', 'Senior Project Manager'].includes(e.designation));

    /* ---------------------------- clients ------------------------------ */
    db.clients = CLIENTS.map((c, i) => ({
      id: id('CLI', i + 1), name: c[0], type: c[1], city: c[2], contact: r.pick(NAMES), email: 'projects@' + U.slug(c[0]) + '.com',
      phone: '+91 ' + r.int(80, 99) + ' ' + r.int(10000, 99999) + ' ' + r.int(10000, 99999),
      gst: r.pick(['06', '27', '29', '09']) + 'AAB' + U.slug(c[0]).slice(0, 3).toUpperCase() + r.int(1000, 9999) + 'K1Z' + r.int(1, 9),
      since: U.iso(new Date(2019 + (i % 6), (i * 4) % 12, 4 + (i % 20))), rating: U.round(3.6 + r() * 1.4, 1),
      terms: r.pick(['30 days', '45 days', '15 days', 'Advance + 30']), owner: r.pick(employees).id, active: true, address: c[2] + ', India'
    }));

    /* ---------------------------- vendors ------------------------------ */
    db.vendors = VENDORS.map((v, i) => {
      const rating = U.round(3.2 + r() * 1.7, 1);
      return {
        id: id('VND', i + 1), code: 'V-' + String(101 + i), name: v[0], category: v[1], city: v[2], contact: v[3],
        email: 'sales@' + U.slug(v[0]) + '.in', phone: '+91 ' + r.int(80, 99) + ' ' + r.int(10000, 99999) + ' ' + r.int(10000, 99999),
        gst: r.pick(['06', '27', '29', '09', '07']) + 'AAC' + r.int(1000, 9999) + 'M1Z' + r.int(1, 9),
        pan: 'AAC' + r.int(1000, 9999) + 'M', rating, status: i === 22 ? 'Blacklisted' : i === 17 ? 'On Hold' : 'Active',
        terms: r.pick(['30 days', '45 days', '15 days', 'Advance 50%']), ratingCount: r.int(4, 30),
        onTime: r.int(62, 99), quality: r.int(65, 99), activePos: 0, spend: 0, docs: r.chance(.85),
        ifsc: r.pick(['HDFC0001234', 'ICIC0000456', 'SBIN0007891']), ac: String(r.int(10000000000, 99999999999)),
        msme: r.chance(.4), since: U.iso(new Date(2019 + (i % 5), (i * 3) % 12, 5 + (i % 22))), paymentDue: 0
      };
    });

    /* --------------------------- item master --------------------------- */
    db.items = ITEMS.map((it, i) => ({
      id: id('ITM', i + 1), code: it[1], name: it[2], trade: it[0], unit: it[3], rate: it[4], brand: it[5],
      hsn: r.pick(['7308', '4412', '6907', '3209', '8539', '8415', '8481', '7007', '9403', '2523']),
      gst: it[0] === 'Labour' ? 0 : r.pick([18, 18, 28, 12]), type: it[0] === 'Labour' ? 'Service' : 'Material',
      spec: 'Approved make: ' + it[5] + '. Warranty as per OEM standard.', status: 'Active',
      lastRate: it[4], category: it[0], stockUom: it[3]
    }));

    /* ---------------------------- projects ----------------------------- */
    const projDefs = [
      ['Amazon Development Centre — BLR8 Fitout', 0, 'Corporate Fitout', 'Bengaluru', 8250, 'In Progress', 0.62],
      ['Concentrix Floor 7 & 8 Interior Works', 1, 'Corporate Fitout', 'Gurugram', 6400, 'In Progress', 0.74],
      ['The Executive Centre — Golf Course Rd', 3, 'Coworking', 'Gurugram', 3800, 'In Progress', 0.41],
      ['Cafe Mocha — Khan Market Flagship', 5, 'F&B Fitout', 'Delhi', 420, 'In Progress', 0.55],
      ['Nexus Mall Food Court Renovation', 10, 'Retail Fitout', 'Pune', 2150, 'In Progress', 0.28],
      ['MedCare OPD Block — Phase 2', 9, 'Healthcare Fitout', 'Gurugram', 4780, 'In Progress', 0.19],
      ['Bata Flagship Store — Andheri', 15, 'Retail Fitout', 'Mumbai', 980, 'Snagging', 0.94],
      ['JSW Homes HQ — Worli Fitout', 6, 'Corporate Fitout', 'Mumbai', 7150, 'In Progress', 0.48],
      ['Urban Nest Tower B — 34 Units', 12, 'Residential Construction', 'Gurugram', 12800, 'In Progress', 0.36],
      ['TechNova Campus Cafe & Lounge', 13, 'F&B Fitout', 'Noida', 760, 'Completed', 1],
      ['HDFC Securities Wealth Centre', 17, 'Corporate Fitout', 'Mumbai', 1560, 'Completed', 1],
      ['ICICI Home Finance — Regional Office', 2, 'Corporate Fitout', 'Mumbai', 1890, 'Completed', 1],
      ['Bright Future School — Block C Extension', 11, 'Commercial Construction', 'Noida', 3640, 'On Hold', 0.12],
      ['Olive Tree Resort — Villas Phase 1', 8, 'Hospitality Fitout', 'Goa', 8900, 'Planning', 0.04],
      ['DHL Sort Centre — Office Wing', 14, 'Corporate Fitout', 'Gurugram', 1340, 'Planning', 0.02],
      ['Sodexo Command Centre', 16, 'Corporate Fitout', 'Gurugram', 520, 'In Progress', 0.66]
    ];
    db.projects = projDefs.map((p, i) => {
      const [name, cliIdx, type, city, valueL, status, prog] = p;
      const client = db.clients[cliIdx];
      const startOff = status === 'Completed' ? -r.int(430, 620) : status === 'Planning' ? r.int(12, 40) : -r.int(60, 330);
      const durDays = status === 'Completed' ? r.int(150, 210) : Math.round(r.int(160, 320));
      const start = U.addD(today, startOff), end = U.addD(start, durDays);
      const contractValue = valueL * 100000;
      const budget = Math.round(contractValue * (0.78 + r() * 0.05));
      const spent = Math.round(budget * (status === 'Completed' ? 0.97 : prog * (0.88 + r() * 0.2)));
      const pm = pmPool[i % pmPool.length];
      const clientApproved = status === 'Completed' ? 100 : Math.round(prog * 100 + r.int(-6, 4));
      return {
        id: id('PRJ', i + 1), code: 'MK-' + String(1024 + i), name, type, city, state: city === 'Mumbai' ? 'Maharashtra' : city === 'Bengaluru' ? 'Karnataka' : city === 'Pune' ? 'Maharashtra' : city === 'Goa' ? 'Goa' : city === 'Delhi' ? 'Delhi' : 'Haryana',
        clientId: client.id, client: client.name, clientContact: client.contact, pmId: pm.id, pm: pm.name,
        status, health: status === 'Completed' ? 'Closed' : status === 'On Hold' ? 'At Risk' : prog > 0.7 ? (r.chance(.75) ? 'On Track' : 'At Risk') : r.chance(.72) ? 'On Track' : r.chance(.5) ? 'At Risk' : 'Critical',
        start: U.iso(start), end: U.iso(end), baselineEnd: U.iso(U.addD(end, r.int(-6, 22))),
        progress: Math.round(prog * 100), contractValue, budget, spent,
        billed: Math.round(contractValue * (status === 'Completed' ? 0.98 : prog * (0.72 + r() * 0.2))),
        received: Math.round(contractValue * (status === 'Completed' ? 0.95 : prog * (0.55 + r() * 0.22))),
        area: Math.round((valueL * 100000) / r.int(2600, 4200)), floors: r.int(1, 4), city2: city,
        unitId: db.units[i % 4].id, qs: employees[(i * 3 + 6) % employees.length].id, siteEng: employees[(i * 5 + 9) % employees.length].id,
        margin: U.round(((contractValue - budget) / contractValue) * 100, 1),
        retainer: status === 'Completed' ? 0 : U.round(contractValue * 0.05), retentionPct: 5,
        tags: r.some(TAG_DEFS.map(t => t.name), r.int(1, 3)),
        pmc: r.chance(.35) ? r.pick(['Turner & Townsend', 'Currie & Brown', 'Arcadis', 'Internal PMC']) : '',
        description: type + ' project executed by Managekaro: civil, MEP, finishes, furniture and handover. Scope includes design development, approvals, procurement, execution and snag closure.',
        createdAt: U.iso(U.addD(start, -r.int(20, 60))), clientApproved: Math.min(100, clientApproved),
        lastReport: U.iso(U.addD(today, -r.int(0, 4))), statusNote: status === 'On Hold' ? 'Awaiting client NOC for Block C structure.' : ''
      };
    });
    const P = db.projects;

    /* ------------------------------ BOQ -------------------------------- */
    db.boq = [];
    let boqSeq = 0;
    P.forEach((p, pi) => {
      const lines = r.int(9, 15);
      const bucket = db.items.filter(it => it.type === 'Material');
      const picked = r.some(bucket, lines);
      let total = 0;
      picked.forEach((it, j) => {
        const qty = it.unit === 'sqft' ? r.amt(600, 12000) / 100 : it.unit === 'nos' ? r.int(2, 60) : it.unit === 'rmt' || it.unit === 'rft' ? r.int(20, 320) : r.int(5, 90);
        const q = U.round(Math.max(1, qty), it.unit === 'sqft' ? 0 : 0);
        const rate = U.round(it.rate * (0.94 + r() * 0.16), 0);
        const amount = Math.round(q * rate);
        total += amount;
        const executed = p.status === 'Completed' ? q : U.round(q * (p.progress / 100) * (0.8 + r() * 0.35), 0);
        boqSeq++;
        db.boq.push({
          id: id('BOQ', boqSeq), projectId: p.id, code: 'B-' + String(j + 1).padStart(2, '0') + '-' + it.trade.slice(0, 3).toUpperCase(),
          trade: it.trade, description: it.name, itemId: it.id, unit: it.unit, qty: q, rate, amount,
          executedQty: Math.min(q, executed), certifiedQty: Math.min(q, Math.round(executed * 0.92)),
          orderedQty: Math.min(q, U.round(executed * (1 + r() * 0.12), 0)), progress: U.clamp(Math.round((Math.min(q, executed) / q) * 100), 0, 100),
          clientConfirmed: r.chance(p.progress > 50 ? .85 : .5), status: p.status === 'Completed' ? 'Closed' : 'Active',
          budgetRate: U.round(rate * (0.82 + r() * 0.1), 0), variance: 0, wbs: it.trade.slice(0, 3).toUpperCase() + '-0' + (j + 1),
          notes: r.chance(.2) ? 'Client-approved make list applies.' : '', updatedAt: p.lastReport
        });
      });
      // normalise project contract value roughly to BOQ (keep as-is; variance shown in UI)
      db.boq.filter(b => b.projectId === p.id).forEach(b => { b.variance = Math.round((b.rate - b.budgetRate) * b.qty); });
      p.boqValue = total;
    });

    /* --------------------------- activities ---------------------------- */
    const ACT_TPL = [
      ['Site handover & mobilization', 'Civil', .05], ['Demolition & debris removal', 'Civil', .05], ['Setting out & marking', 'Civil', .03],
      ['Civil & masonry works', 'Civil', .09], ['Blockwork & plaster', 'Civil', .07], ['Electrical containment / conduiting', 'Electrical', .10],
      ['HVAC ducting & piping', 'HVAC', .10], ['Plumbing & sanitary rough-in', 'Plumbing', .07], ['Fire sprinkler & detection', 'Fire Fighting', .06],
      ['Gypsum ceiling framework & boarding', 'False Ceiling', .08], ['Flooring & skirting', 'Flooring', .08], ['Painting & polishing', 'Painting', .07],
      ['Furniture & workstation install', 'Furniture', .08], ['Glass partitions & doors', 'Glass & Aluminium', .05], ['Lighting & fixtures', 'Electrical', .04],
      ['Signage & branding', 'Signage', .02], ['Snagging & handover', 'Snagging', .03]
    ];
    db.activities = [];
    let actSeq = 0;
    P.forEach(p => {
      const totalDays = Math.max(30, U.diff(p.end, p.start));
      let cursor = 0;
      ACT_TPL.forEach((a, j) => {
        actSeq++;
        const dur = Math.max(4, Math.round(totalDays * a[2] + r.int(-2, 3)));
        const s = U.addD(p.start, cursor + r.int(-2, 2));
        const e = U.addD(s, dur);
        cursor += Math.max(3, Math.round(dur * 0.55));
        const shouldBe = U.clamp((U.diff(U.today(), s) / dur) * 100, 0, 100);
        let prog = p.status === 'Completed' ? 100 : shouldBe > 0 ? U.round(shouldBe * (0.7 + r() * 0.42), 0) : 0;
        prog = p.status === 'Planning' ? 0 : U.clamp(prog, 0, 100);
        const late = prog < shouldBe - 12 && shouldBe < 100;
        db.activities.push({
          id: id('ACT', actSeq), projectId: p.id, code: 'A' + String(j + 1).padStart(2, '0'), name: a[0], trade: a[1],
          start: U.iso(s), end: U.iso(e), baselineStart: U.iso(U.addD(s, r.int(-5, 3))), baselineEnd: U.iso(U.addD(e, r.int(-8, 6))),
          progress: prog, weight: Math.round(a[2] * 100), assigneeId: j % 3 === 0 ? p.siteEng : employees[(j * 7 + 2) % employees.length].id,
          status: p.status === 'On Hold' ? 'On Hold' : prog === 100 ? 'Completed' : prog > 0 ? 'In Progress' : 'Not Started',
          dependency: j > 0 ? 'A' + String(j).padStart(2, '0') : '', milestone: j === 0 || j === ACT_TPL.length - 1,
          late, slack: late ? -r.int(1, 16) : r.int(0, 9), notes: late ? 'Flagged at weekly review — see delay register.' : ''
        });
      });
    });

    /* ---------------------------- milestones --------------------------- */
    db.milestones = [];
    P.forEach(p => {
      const names = ['Kick-off & site handover', 'Design freeze / GFC', 'Procurement complete', 'Ceiling & MEP closure', '50% physical progress', 'Furniture installation', 'Snag list frozen', 'Handover & DLP start'];
      names.forEach((n, j) => {
        const d = U.addD(p.start, Math.round((U.diff(p.end, p.start) / (names.length + 1)) * (j + 1)));
        const done = p.status === 'Completed' ? true : (p.progress / 100) * names.length > j;
        db.milestones.push({ id: U.uid('MS'), projectId: p.id, name: n, date: U.iso(d), status: done ? 'Achieved' : (U.diff(d, U.today()) < 0 ? 'Missed' : 'Pending'), weight: 10 });
      });
    });

    /* ------------------------------ snags ------------------------------ */
    db.snags = [];
    let snagSeq = 0;
    P.forEach(p => {
      const n = p.status === 'Planning' ? 0 : p.status === 'Completed' ? r.int(4, 9) : Math.round(r.int(6, 26) * (0.4 + p.progress / 120));
      for (let i = 0; i < n; i++) {
        snagSeq++;
        const closed = p.status === 'Completed' ? r.chance(.94) : r.chance(.45);
        const raised = U.addD(p.start, r.int(Math.round(U.diff(p.start, p.end) * .25), Math.max(30, U.diff(U.today(), p.start))));
        db.snags.push({
          id: id('SNG', snagSeq), code: 'SN-' + String(snagSeq).padStart(3, '0'), projectId: p.id,
          area: r.pick(['Reception', 'Workstations A', 'Workstations B', 'Cabin 101', 'Board Room', 'Pantry', 'Washroom M', 'Washroom F', 'Lobby', 'Server Room', 'Terrace', 'Cafeteria']),
          trade: r.pick(TRADES), category: r.pick(['Fitment', 'Finish', 'Alignment', 'Functionality', 'Leakage', 'Electrical', 'Hardware', 'Cleaning']),
          description: r.pick([
            'Tile joint mismatch near entry', 'Paint patchy on bulkhead', 'Door shutter not closing flush', 'Skirting gap 3mm at corner',
            'Socket plate loose', 'Glass edge chipping observed', 'Ceiling grid level mismatch', 'Leakage under wash basin trap',
            'Veneer peel-off at shutter edge', 'Switch not operational', 'Laminate bubble on workstation top', 'Floor tile hollow sound',
            'Diffuser alignment uneven', 'Fire sprinkler height below ceiling', 'Signage LED not glowing', 'Washroom mirror edge sharp'
          ]),
          priority: r.pick(['Low', 'Medium', 'High', 'Critical']),
          raisedBy: employees[r.int(0, employees.length - 1)].id, raisedOn: U.iso(raised),
          assignedTo: r.chance(.55) ? db.vendors[r.int(0, 20)].id : employees[r.int(0, employees.length - 1)].id,
          assignType: 'vendor', dueDate: U.iso(U.addD(raised, r.int(2, 14))),
          status: closed ? 'Closed' : r.pick(['Open', 'In Progress', 'Resolved', 'Reopened']),
          closedOn: closed ? U.iso(U.addD(raised, r.int(2, 18))) : '',
          clientFacing: r.chance(.55), photos: r.int(1, 3), rootCause: r.chance(.4) ? r.pick(['Workmanship', 'Material defect', 'Design intent', 'Transport damage']) : '',
          costImpact: r.chance(.18) ? r.amt(1500, 42000) : 0, severityScore: r.int(1, 5)
        });
      }
    });

    /* ------------------------------ RFIs ------------------------------- */
    db.rfis = [];
    let rfiSeq = 0;
    P.filter(p => p.progress > 5 && p.status !== 'Completed').forEach(p => {
      for (let i = 0; i < r.int(2, 6); i++) {
        rfiSeq++;
        const st = r.pick(['Open', 'Open', 'Answered', 'Closed']);
        db.rfis.push({
          id: id('RFI', rfiSeq), code: 'RFI-' + String(rfiSeq).padStart(3, '0'), projectId: p.id,
          subject: r.pick(['Clarification on ceiling height at lobby', 'Make approval for VRV indoor units', 'Structural opening for AHU', 'Skirting detail at glass partition', 'Fire NOC drawing revision', 'Pantry drainage slope', 'Signage fixing detail on ACP', 'Color approval for accent wall']),
          raisedBy: p.siteEng, raisedOn: U.iso(U.addD(U.today(), -r.int(1, 34))), toWhom: r.pick(['Client', 'PMC', 'Design Studio', 'Structural Consultant']),
          status: st, priority: r.pick(['Low', 'Medium', 'High']), dueDate: U.iso(U.addD(U.today(), r.int(-6, 12))),
          answer: st === 'Answered' || st === 'Closed' ? 'Refer GFC rev-R3 detail 4/A-201. Proceed with 2700mm clear height.' : '',
          costImpact: r.chance(.2) ? r.amt(5000, 85000) : 0, timeImpact: r.chance(.35) ? r.int(1, 7) : 0, attachment: r.chance(.4)
        });
      }
    });

    /* ------------------------------ DPRs ------------------------------- */
    db.dprs = [];
    P.filter(p => p.progress > 3 && p.status !== 'Planning').forEach(p => {
      for (let i = 0; i < r.int(3, 7); i++) {
        const d = U.addD(U.today(), -i * r.int(1, 3));
        db.dprs.push({
          id: U.uid('DPR'), projectId: p.id, date: U.iso(d), by: p.siteEng,
          manpower: r.int(18, 96), skilled: r.int(6, 32), helpers: r.int(10, 52),
          progressPct: Math.max(0, U.round(p.progress - i * 0.7, 0)),
          workDone: r.pick(['Gypsum ceiling framing completed in Workstation B.', 'Flooring in cabins completed; skirting pending.', 'HVAC duct insulation 80% done; diffuser layout approved.', 'Painting 2nd coat in reception completed.', 'Electrical containment in pantry completed.', 'Glass partition installation started at board room.']),
          blockers: r.chance(.42) ? r.pick(['Client approval pending for laminate shade.', 'Material shortfall — tiles 220 sqft required.', 'Labour shortage for carpentry.', 'Lift not available for material movement.', 'Power backup not provided by building.', 'No blocker reported.']) : 'No blocker reported.',
          materialIn: r.int(0, 6), materialOut: r.int(0, 4), safetyIncidents: r.chance(.06) ? 1 : 0,
          weather: r.pick(['Clear', 'Clear', 'Cloudy', 'Light Rain']), photos: r.int(2, 8),
          clientVisible: true, approved: r.chance(.8), qualityScore: r.int(78, 98)
        });
      }
    });

    /* --------------------------- documents ----------------------------- */
    db.docs = [];
    let docSeq = 0;
    const DWG = [['Architectural Layout', 'A-101'], ['Reflected Ceiling Plan', 'A-201'], ['Flooring Layout', 'A-301'], ['Furniture Layout', 'A-401'], ['MEP Combined Services', 'M-101'], ['Electrical Single Line', 'E-101'], ['HVAC Duct Layout', 'H-101'], ['Plumbing Layout', 'P-101'], ['Fire Layout', 'F-101'], ['Detail Sections', 'A-501'], ['Signage Details', 'A-601'], ['BOQ & Specification', 'Q-101']];
    P.forEach(p => {
      DWG.forEach((d, j) => {
        if (j > 2 && r.chance(.25)) return;
        docSeq++;
        const rev = r.int(0, 3);
        db.docs.push({
          id: id('DOC', docSeq), projectId: p.id, name: d[0], drawingNo: d[1] + '-' + (j + 1), category: r.pick(['Drawing', 'Drawing', 'BOQ', 'Report', 'Certificate', 'Contract']),
          discipline: d[1].startsWith('A') ? 'Architecture' : d[1].startsWith('M') ? 'MEP' : d[1].startsWith('E') ? 'Electrical' : 'Structure',
          version: 'R' + rev, status: r.pick(['Approved', 'Approved', 'For Review', 'Superseded', 'Issued']),
          uploadedBy: r.pick(employees).id, uploadedOn: U.iso(U.addD(U.today(), -r.int(1, 120))), size: (r.int(400, 9800) / 100) + ' MB',
          ext: 'pdf', clientShared: r.chance(.7), rev: rev, pins: r.int(0, 4), transmittals: r.int(1, 3),
          approvalBy: r.chance(.6) ? 'PMC + Client' : 'Internal', tags: r.some(TRADES, 2)
        });
      });
    });

    /* ------------------------- change orders --------------------------- */
    db.changeOrders = [];
    let coSeq = 0;
    P.filter(p => p.progress > 8).forEach(p => {
      const n = r.int(1, 4);
      for (let i = 0; i < n; i++) {
        coSeq++;
        const amt = r.amt(45000, 850000);
        db.changeOrders.push({
          id: id('CO', coSeq), code: 'CO-' + String(coSeq).padStart(3, '0'), projectId: p.id,
          title: r.pick(['Additional workstations at Level 8', 'Upgrade to premium vinyl flooring', 'Extra AC cassette in cafeteria', 'Design change — reception feature wall', 'Additional fire sprinklers for storage', 'Client requested signage revision', 'Change of workstation fabric', 'Extra electrical points in server room']),
          type: r.pick(['Addition', 'Omission', 'Addition', 'Substitution']), amount: amt,
          raisedOn: U.iso(U.addD(p.start, r.int(20, Math.max(25, U.diff(U.today(), p.start))))),
          status: r.pick(['Approved', 'Approved', 'Pending', 'Under Review', 'Rejected']), raiser: r.pick(employees).id,
          impactDays: r.int(0, 12), clientPo: r.chance(.6) ? 'CPO-' + r.int(1000, 9999) : '',
          notes: 'Variation measured and certified by QS; linked to BOQ item and schedule.', approver: pmPool[i % pmPool.length].id
        });
      }
    });

    /* ------------------------ purchase requests ------------------------ */
    db.prs = [];
    let prSeq = 0;
    P.filter(p => p.status !== 'Completed' && p.status !== 'Planning').forEach(p => {
      for (let i = 0; i < r.int(2, 5); i++) {
        prSeq++;
        const it = r.pick(db.items.filter(x => x.type === 'Material'));
        const qty = r.int(10, 400);
        db.prs.push({
          id: id('PR', prSeq), code: 'PR-' + String(prSeq).padStart(3, '0'), projectId: p.id, date: U.iso(U.addD(U.today(), -r.int(0, 40))),
          raisedBy: r.pick(employees).id, item: it.name, itemId: it.id, qty, unit: it.unit, estRate: it.rate,
          estAmount: Math.round(qty * it.rate), requiredBy: U.iso(U.addD(U.today(), r.int(2, 30))),
          status: r.pick(['Approved', 'Approved', 'Pending Approval', 'Rejected', 'PO Created']), priority: r.pick(['Normal', 'High', 'Urgent']),
          budgetLine: it.trade, justification: 'Required for ongoing ' + it.trade + ' activity as per schedule.', approver: pmPool[i % pmPool.length].id
        });
      }
    });

    /* ------------------------------ POs -------------------------------- */
    db.pos = [];
    let poSeq = 0;
    P.filter(p => p.status !== 'Planning').forEach(p => {
      const n = p.status === 'Completed' ? 4 : r.int(3, 7);
      for (let i = 0; i < n; i++) {
        const v = db.vendors[r.int(0, 19)];
        const lines = r.int(2, 5);
        const items = r.some(db.items.filter(x => x.type === 'Material'), lines).map(it => {
          const qty = r.int(5, it.unit === 'sqft' ? 4000 : 120);
          return { itemId: it.id, name: it.name, unit: it.unit, qty, rate: it.rate, amount: Math.round(qty * it.rate), received: 0 };
        });
        items.forEach(l => { l.received = r.chance(.7) ? U.round(l.qty * (0.4 + r() * 0.6), 0) : 0; });
        const amount = U.sum(items, l => l.amount);
        const tax = Math.round(amount * 0.18);
        poSeq++;
        const status = p.status === 'Completed' ? 'Closed' : r.pick(['Approved', 'Approved', 'Partially Received', 'Fully Received', 'Pending Approval', 'Cancelled']);
        db.pos.push({
          id: id('PO', poSeq), code: 'PO/' + U.fyLabel(p.start).slice(3, 7).replace(' ', '') + '/' + String(poSeq).padStart(4, '0'),
          projectId: p.id, vendorId: v.id, vendor: v.name, date: U.iso(U.addD(p.start, r.int(5, Math.max(10, Math.min(U.diff(U.today(), p.start) - 1, 250))))),
          deliveryDate: U.iso(U.addD(U.today(), r.int(-25, 25))), items, amount, tax, total: amount + tax,
          status, paymentTerms: v.terms, approvedBy: pmPool[i % pmPool.length].id, grnCount: 0, invoiced: 0, paid: 0,
          budgeted: r.chance(.85), notes: 'As per approved BOQ and technical specification.', deliverySite: p.city,
          retention: 5, advance: r.chance(.2) ? Math.round(amount * .3) : 0
        });
      }
    });

    /* ------------------------------ GRNs ------------------------------- */
    db.grns = [];
    let grnSeq = 0;
    db.pos.forEach(po => {
      if (['Approved', 'Pending Approval', 'Cancelled'].includes(po.status)) return;
      const n = po.status === 'Fully Received' ? 2 : 1;
      for (let i = 0; i < n; i++) {
        grnSeq++;
        const grnItems = po.items.map(l => ({ name: l.name, ordered: l.qty, received: Math.round(l.qty * (po.status === 'Fully Received' ? 1 : 0.5)), accepted: 0, rejected: 0 }));
        grnItems.forEach(g => { g.rejected = r.chance(.18) ? Math.round(g.received * 0.04) : 0; g.accepted = g.received - g.rejected; });
        db.grns.push({
          id: id('GRN', grnSeq), code: 'GRN-' + String(grnSeq).padStart(4, '0'), poId: po.id, poCode: po.code, projectId: po.projectId,
          vendor: po.vendor, vendorId: po.vendorId, date: U.iso(U.addD(po.date, r.int(3, 22))), items: grnItems,
          status: r.pick(['Accepted', 'Accepted', 'Partially Accepted', 'Rejected']), receivedBy: r.pick(employees).id,
          warehouseId: r.pick(['w1', 'w2', 'w3']), invoiceNo: r.chance(.6) ? 'INV-' + r.int(1000, 9999) : '', dcNo: 'DC-' + r.int(1000, 9999),
          qualityCheck: r.pick(['Passed', 'Passed', 'Passed with remarks', 'Failed']), remarks: r.chance(.3) ? 'Short supply noted, balance to follow.' : ''
        });
        po.grnCount++;
      }
    });

    /* ------------------------- vendor invoices -------------------------- */
    db.invoices = [];
    let invSeq = 0;
    db.pos.filter(po => po.status !== 'Pending Approval' && po.status !== 'Cancelled').forEach(po => {
      if (!r.chance(.8)) return;
      const taxable = Math.round(po.amount * (0.5 + r() * 0.5));
      const tax = Math.round(taxable * 0.18);
      const total = taxable + tax;
      const paidAmt = po.status === 'Closed' || r.chance(.45) ? total : r.chance(.5) ? Math.round(total * .4) : 0;
      invSeq++;
      db.invoices.push({
        id: id('INV', invSeq), code: 'VINV-' + String(invSeq).padStart(4, '0'), projectId: po.projectId, vendorId: po.vendorId, vendor: po.vendor,
        poId: po.id, poCode: po.code, date: U.iso(U.addD(po.date, r.int(2, 20))), dueDate: U.iso(U.addD(po.date, r.int(22, 55))),
        taxable, tax, total, tds: Math.round(taxable * 0.02), retention: Math.round(taxable * 0.05),
        net: total - Math.round(taxable * 0.02) - Math.round(taxable * 0.05),
        paid: paidAmt, status: paidAmt >= total ? 'Paid' : paidAmt > 0 ? 'Partially Paid' : 'Pending',
        approval: r.pick(['Approved', 'Approved', 'Pending Approval', 'On Hold']), gstin: r.pick(['06AAC1234M1Z5', '27AAC5678M1Z3', '29AAC9012M1Z1']),
        threeWayMatch: r.chance(.82), holdReason: '', invoiceNo: 'GST/' + r.int(100, 999) + '/' + String(20 + r.int(0, 5)),
        createdBy: r.pick(employees).id
      });
    });

    /* ---------------------------- payments ----------------------------- */
    db.payments = [];
    let paySeq = 0;
    db.invoices.filter(i => i.paid > 0).forEach(inv => {
      paySeq++;
      db.payments.push({
        id: id('PAY', paySeq), code: 'PAY-' + String(paySeq).padStart(4, '0'), projectId: inv.projectId, vendorId: inv.vendorId, vendor: inv.vendor,
        invoiceId: inv.id, invoiceCode: inv.code, date: U.iso(U.addD(inv.date, r.int(5, 40))), amount: inv.paid,
        mode: r.pick(['NEFT', 'RTGS', 'NEFT', 'Cheque', 'UPI']), ref: r.pick(['HDFC', 'ICIC', 'UTIB']) + r.int(100000000, 999999999),
        status: r.pick(['Released', 'Released', 'Released', 'Processing']), releasedBy: r.pick(employees).id,
        tds: Math.round(inv.taxable * 0.02), approvedBy: pmPool[0].id, bank: 'HDFC Bank ••4567'
      });
    });

    /* -------------------------- client billing -------------------------- */
    db.clientInvoices = [];
    let ciSeq = 0;
    P.filter(p => p.progress > 10).forEach(p => {
      const n = p.status === 'Completed' ? 5 : r.int(2, 5);
      for (let i = 0; i < n; i++) {
        ciSeq++;
        const amt = Math.round((p.contractValue / n) * (0.85 + r() * 0.25));
        const recd = r.chance(.7) ? amt : r.chance(.5) ? Math.round(amt * .5) : 0;
        db.clientInvoices.push({
          id: id('CINV', ciSeq), code: 'MKINV/' + String(24 + i) + '/' + String(ciSeq).padStart(3, '0'), projectId: p.id, clientId: p.clientId, client: p.client,
          date: U.iso(U.addD(p.start, Math.round((U.diff(U.today(), p.start) / n) * (i + 1)))), dueDate: U.iso(U.addD(p.start, Math.round((U.diff(U.today(), p.start) / n) * (i + 1)) + 30)),
          amount: amt, tax: Math.round(amt * 0.18), total: amt + Math.round(amt * 0.18), received: recd,
          status: recd >= amt ? 'Paid' : recd > 0 ? 'Partially Paid' : U.diff(U.today(), U.addD(p.start, Math.round((U.diff(U.today(), p.start) / n) * (i + 1)) + 30)) < 0 ? 'Overdue' : 'Sent',
          workOrder: p.code, milestone: r.pick(['Mobilisation advance', 'On 40% progress', 'On 75% progress', 'On completion', 'Retention release']),
          gstType: 'IGST 18%', remarks: '', aging: 0
        });
      }
    });
    db.clientInvoices.forEach(c => { c.aging = c.status === 'Paid' ? 0 : Math.max(0, U.diff(U.today(), c.dueDate)); });

    /* ---------------------------- expenses ------------------------------ */
    db.expenses = [];
    let expSeq = 0;
    P.forEach(p => {
      for (let i = 0; i < r.int(2, 6); i++) {
        expSeq++;
        const head = r.pick(['Travel', 'Labour', 'Transport', 'Site Consumables', 'Equipment Rental', 'Food & Welfare', 'Safety Gear', 'Courier', 'Printing', 'Miscellaneous']);
        const amt = r.amt(800, 68000);
        db.expenses.push({
          id: id('EXP', expSeq), code: 'EXP-' + String(expSeq).padStart(4, '0'), projectId: p.id, head, amount: amt,
          date: U.iso(U.addD(U.today(), -r.int(0, 70))), by: r.pick(employees).id, mode: r.pick(['Cash', 'UPI', 'Company Card', 'Reimbursement']),
          status: r.pick(['Approved', 'Approved', 'Approved', 'Pending', 'Rejected']), bill: r.chance(.8), gst: r.chance(.5),
          description: head + ' expense at ' + p.city + ' site', costCode: 'CC-' + r.int(100, 999), approvedBy: pmPool[0].id
        });
      }
    });

    /* --------------------------- rate contracts ------------------------- */
    db.rateContracts = db.vendors.slice(0, 14).map((v, i) => ({
      id: id('RC', i + 1), code: 'RC-' + String(101 + i), vendorId: v.id, vendor: v.name, category: v.category,
      validFrom: U.iso(U.addD(U.today(), -r.int(60, 200))), validTo: U.iso(U.addD(U.today(), r.int(30, 300))),
      items: r.int(4, 18), discount: r.int(3, 14), status: r.chance(.85) ? 'Active' : 'Expiring', spend: r.amt(200000, 4200000),
      paymentTerms: v.terms, creditDays: r.int(15, 45), negotiator: r.pick(employees).id
    }));

    /* ------------------------------ stores ------------------------------ */
    db.warehouses = [
      { id: 'w1', name: 'Gurugram Central Store', city: 'Gurugram', type: 'Central', incharge: employees[20].id, area: '4,200 sqft', capacity: 82 },
      { id: 'w2', name: 'Mumbai Site Store', city: 'Mumbai', type: 'Site Store', incharge: employees[24].id, area: '1,600 sqft', capacity: 64 },
      { id: 'w3', name: 'Bengaluru Site Store', city: 'Bengaluru', type: 'Site Store', incharge: employees[28].id, area: '1,200 sqft', capacity: 48 },
      { id: 'w4', name: 'Noida Workshop', city: 'Noida', type: 'Workshop', incharge: employees[32].id, area: '3,000 sqft', capacity: 71 }
    ];
    db.stock = [];
    let stSeq = 0;
    db.warehouses.forEach(w => {
      r.some(db.items.filter(i => i.type === 'Material'), r.int(10, 18)).forEach(it => {
        stSeq++;
        const min = r.int(5, 40), qty = r.int(0, 220);
        db.stock.push({
          id: id('STK', stSeq), itemId: it.id, item: it.name, code: it.code, unit: it.unit, warehouseId: w.id,
          qty, min, max: min * 4, rate: it.rate, value: qty * it.rate, location: r.pick(['Rack A-1', 'Rack A-2', 'Rack B-1', 'Rack B-3', 'Floor', 'Mezzanine']),
          status: qty === 0 ? 'Out of Stock' : qty < min ? 'Low Stock' : 'In Stock', lastMove: U.iso(U.addD(U.today(), -r.int(0, 30)))
        });
      });
    });
    db.stockMoves = [];
    let mvSeq = 0;
    db.stock.slice(0, 40).forEach(s => {
      mvSeq++;
      db.stockMoves.push({
        id: id('MV', mvSeq), itemId: s.itemId, item: s.item, warehouseId: s.warehouseId, type: r.pick(['Inward', 'Outward', 'Outward', 'Transfer', 'Adjustment']),
        qty: r.int(2, 40), date: U.iso(U.addD(U.today(), -r.int(0, 20))), ref: r.pick(['GRN-0012', 'MR-0043', 'TRF-0007', 'PO/2425/0012']),
        projectId: r.pick(P).id, by: r.pick(employees).id, notes: ''
      });
    });

    /* ------------------------------ assets ------------------------------ */
    db.assets = Array.from({ length: 26 }, (_, i) => {
      const a = [
        ['Scaffolding set 12m', 'Equipment', 'Scaffold'], ['Total station Leica TS06', 'Survey', 'Leica'], ['Dumpy level', 'Survey', 'Bosch'],
        ['Diesel generator 62.5 kVA', 'Equipment', 'Cummins'], ['Cutting machine', 'Power Tool', 'Bosch'], ['Dewalt drill set', 'Power Tool', 'Dewalt'],
        ['Air compressor 2HP', 'Equipment', 'Atlas Copco'], ['Laptop Dell Latitude 5440', 'IT', 'Dell'], ['Laptop MacBook Air M2', 'IT', 'Apple'],
        ['Printer HP LaserJet M404', 'IT', 'HP'], ['Projector Epson EB-X06', 'IT', 'Epson'], ['Mobile Samsung M34', 'IT', 'Samsung'],
        ['Workstation chair (Featherlite)', 'Furniture', 'Featherlite'], ['First aid kit', 'Safety', 'In-house'], ['Safety harness set', 'Safety', 'Karam'],
        ['Fire extinguisher 6kg', 'Safety', 'Ceasefire'], ['Water tanker 5000L', 'Vehicle', 'Tata'], ['Tempo Traveller', 'Vehicle', 'Force'],
        ['Pickup truck Isuzu', 'Vehicle', 'Isuzu'], ['Concrete mixer', 'Equipment', 'Local'], ['Vibrator needle', 'Equipment', 'Local'],
        ['Laser distance meter', 'Survey', 'Bosch'], ['Camera Nikon D5300', 'Media', 'Nikon'], ['Tablet iPad 10', 'IT', 'Apple'],
        ['UPS 5kVA', 'IT', 'APC'], ['Aluminium ladder 12ft', 'Equipment', 'Local']
      ][i];
      return {
        id: id('AST', i + 1), code: 'AST-' + String(1001 + i), name: a[0], category: a[1], make: a[2],
        serial: 'SN' + r.int(1000000, 9999999), assignedTo: r.chance(.6) ? employees[r.int(0, employees.length - 1)].id : '',
        projectId: r.chance(.55) ? P[r.int(0, P.length - 1)].id : '', warehouseId: r.chance(.5) ? 'w1' : 'w4',
        purchaseDate: U.iso(U.addD(U.today(), -r.int(60, 1500))), cost: r.amt(4500, 480000),
        status: r.pick(['In Use', 'In Use', 'In Store', 'Under Repair', 'Retired']), warrantyTo: U.iso(U.addD(U.today(), r.int(-100, 700))),
        condition: r.pick(['Good', 'Good', 'Excellent', 'Needs Service']), lastService: U.iso(U.addD(U.today(), -r.int(10, 240)))
      };
    });

    /* -------------------------- CRM pipeline ---------------------------- */
    const LEAD_SRC = ['Google Ads', 'LinkedIn', 'Referral', 'Walk-in', 'Website Form', 'WhatsApp', 'Exhibition', 'Existing Client'];
    const STAGES = ['New', 'Qualified', 'Site Visit', 'Proposal Sent', 'Negotiation', 'Won'];
    db.leads = Array.from({ length: 42 }, (_, i) => {
      const c = db.clients[i % db.clients.length];
      const stage = i < 4 ? 'Won' : STAGES[r.int(0, 4)];
      const val = r.amt(800000, 65000000);
      return {
        id: id('LEAD', i + 1), code: 'LD-' + String(2401 + i), company: i % 3 === 0 ? c.name : 'Prospect ' + r.pick(['Realty', 'Retail', 'Tech', 'Foods', 'Health', 'Living', 'Ventures', 'Labs']) + ' ' + r.pick(['Pvt Ltd', 'LLP', 'India']),
        contact: r.pick(NAMES), email: 'contact@prospect' + i + '.com', phone: '+91 ' + r.int(80, 99) + ' ' + r.int(10000, 99999) + ' ' + r.int(10000, 99999),
        source: r.pick(LEAD_SRC), stage, value: val, city: r.pick(['Gurugram', 'Delhi', 'Noida', 'Mumbai', 'Bengaluru', 'Pune']),
        type: r.pick(PROJECT_TYPES), ownerId: employees[r.int(36, employees.length - 1)].id,
        createdOn: U.iso(U.addD(U.today(), -r.int(1, 90))), expectedClose: U.iso(U.addD(U.today(), r.int(-10, 60))),
        probability: stage === 'Won' ? 100 : stage === 'Negotiation' ? 70 : stage === 'Proposal Sent' ? 50 : stage === 'Site Visit' ? 30 : stage === 'Qualified' ? 20 : 10,
        area: r.int(1200, 42000), notes: r.chance(.4) ? 'Requires design presentation before commercial.' : '',
        lastActivity: U.iso(U.addD(U.today(), -r.int(0, 12))), nextFollowup: U.iso(U.addD(U.today(), r.int(-3, 14))), score: r.int(20, 96)
      };
    });
    db.quotations = db.leads.filter(l => ['Proposal Sent', 'Negotiation', 'Won'].includes(l.stage)).map((l, i) => ({
      id: id('QTN', i + 1), code: 'QT/' + U.fyLabel(U.today()).slice(3, 7).replace(' ', '') + '/' + String(101 + i), leadId: l.id, company: l.company,
      date: U.iso(U.addD(U.today(), -r.int(2, 40))), validTo: U.iso(U.addD(U.today(), r.int(3, 28))), amount: l.value,
      tax: Math.round(l.value * 0.18), total: Math.round(l.value * 1.18), status: r.pick(['Sent', 'Sent', 'Under Review', 'Accepted', 'Rejected']),
      version: r.int(1, 3), preparedBy: l.ownerId, sentTo: l.email, items: r.int(6, 20), margin: U.round(14 + r() * 14, 1),
      template: r.pick(['Standard Fitout', 'Design + Build', 'Civil Only', 'Turnkey Retail'])
    }));
    db.visits = Array.from({ length: 12 }, (_, i) => ({
      id: id('SV', i + 1), leadId: db.leads[i].id, company: db.leads[i].company, date: U.iso(U.addD(U.today(), r.int(-20, 8))),
      by: employees[r.int(30, employees.length - 1)].id, status: r.pick(['Scheduled', 'Completed', 'Completed', 'Cancelled']),
      purpose: r.pick(['Site measurement', 'Design brief', 'Technical feasibility', 'Client presentation']), city: db.leads[i].city,
      remarks: 'Measurements captured; site photos uploaded to project folder.'
    }));

    /* ------------------------------- HRM -------------------------------- */
    db.leaveTypes = [
      { id: 'lt1', name: 'Earned Leave', code: 'EL', max: 18, carry: 10, paid: true, color: '#2563EB' },
      { id: 'lt2', name: 'Sick Leave', code: 'SL', max: 12, carry: 0, paid: true, color: '#0E9F6E' },
      { id: 'lt3', name: 'Casual Leave', code: 'CL', max: 10, carry: 0, paid: true, color: '#D97706' },
      { id: 'lt4', name: 'Comp Off', code: 'CO', max: 6, carry: 0, paid: true, color: '#7C3AED' },
      { id: 'lt5', name: 'Loss of Pay', code: 'LOP', max: 0, carry: 0, paid: false, color: '#DC2626' },
      { id: 'lt6', name: 'Maternity', code: 'ML', max: 182, carry: 0, paid: true, color: '#0D9488' }
    ];
    db.holidays = [
      ['Republic Day', '2026-01-26'], ['Holi', '2026-03-14'], ['Labour Day', '2026-05-01'], ['Independence Day', '2026-08-15'],
      ['Diwali', '2026-11-08'], ['Guru Nanak Jayanti', '2026-11-24'], ['Christmas', '2026-12-25']
    ].map((h, i) => ({ id: 'HD' + i, name: h[0], date: h[1], type: h[0] === 'Diwali' || h[0] === 'Holi' ? 'Festival' : 'National' }));
    db.leaves = Array.from({ length: 34 }, (_, i) => {
      const e = employees[r.int(0, employees.length - 1)];
      const lt = db.leaveTypes[r.int(0, 2)];
      const from = U.addD(U.today(), r.int(-60, 30));
      const days = r.int(1, 5);
      return {
        id: id('LV', i + 1), employeeId: e.id, employee: e.name, deptId: e.deptId, type: lt.code, typeName: lt.name,
        from: U.iso(from), to: U.iso(U.addD(from, days - 1)), days, reason: r.pick(['Family function', 'Medical', 'Personal work', 'Travel', 'Child care', 'Wedding in family']),
        status: r.pick(['Approved', 'Approved', 'Pending', 'Rejected', 'Approved']), appliedOn: U.iso(U.addD(from, -r.int(2, 12))),
        approvedBy: pmPool[0].id, contact: '+91 98' + r.int(100000000, 999999999), lop: lt.code === 'LOP'
      };
    });
    db.attendanceShifts = [
      { id: 'sh1', name: 'General', start: '09:30', end: '18:30', grace: 15, hours: 8 },
      { id: 'sh2', name: 'Site Shift', start: '08:00', end: '17:00', grace: 10, hours: 8 },
      { id: 'sh3', name: 'Night (Handover)', start: '22:00', end: '07:00', grace: 10, hours: 8 }
    ];
    db.attendanceRules = { gps: true, selfie: true, geoFence: 250, weeklyOff: 'Sunday', halfDayHours: 4, otAfter: 8, lateMark: 3 };
    db.payroll = [];
    const months = U.lastMonths(3);
    months.forEach((m, mi) => {
      employees.filter(e => e.status !== 'Resigned').forEach(e => {
        const gross = e.gross;
        const basic = Math.round(gross * 0.5), hra = Math.round(basic * 0.4), conv = 1600, special = gross - basic - hra - conv;
        const pf = Math.round(Math.min(basic, 15000) * 0.12), esi = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
        const pt = 200, tds = gross > 60000 ? Math.round(gross * 0.06) : 0;
        const lop = r.chance(.12) ? r.int(1, 2) : 0, ot = r.chance(.25) ? Math.round(r.int(4, 16) * (gross / 208) * 1.5) : 0;
        const deductions = pf + esi + pt + tds + Math.round((gross / 26) * lop);
        db.payroll.push({
          id: U.uid('PR'), month: m.key, monthLabel: m.full, employeeId: e.id, employee: e.name, deptId: e.deptId,
          designation: e.designation, days: 26, present: 26 - lop, lop, ot,
          basic, hra, conv, special, gross: gross + ot, pf, esi, pt, tds, lopAmt: Math.round((gross / 26) * lop),
          deductions, net: gross + ot - deductions, status: mi === months.length - 1 ? r.pick(['Draft', 'Processing', 'Processed']) : 'Paid',
          paidOn: mi === months.length - 1 ? '' : U.iso(U.addD(m.end || m.date, 30)), bank: e.bank, mode: 'NEFT'
        });
      });
    });
    db.jobs = [
      ['Senior Interior Designer', 'Design & Studio', 'Gurugram', 'Full-time', '5-8 yrs', 2, 'Open'],
      ['Project Manager – Fitout', 'Projects & Delivery', 'Mumbai', 'Full-time', '7-10 yrs', 1, 'Open'],
      ['Site Engineer (Civil)', 'Site Operations', 'Bengaluru', 'Full-time', '2-4 yrs', 4, 'Open'],
      ['Quantity Surveyor', 'Projects & Delivery', 'Gurugram', 'Full-time', '3-6 yrs', 2, 'Open'],
      ['Procurement Executive', 'Procurement', 'Noida', 'Full-time', '2-5 yrs', 1, 'Open'],
      ['3D Visualiser', 'Design & Studio', 'Gurugram', 'Contract', '1-3 yrs', 1, 'On Hold'],
      ['HR Business Partner', 'Human Resources', 'Gurugram', 'Full-time', '4-7 yrs', 1, 'Open'],
      ['MEP Engineer', 'Site Operations', 'Pune', 'Full-time', '4-6 yrs', 2, 'Closed']
    ].map((j, i) => ({
      id: id('JOB', i + 1), code: 'JD-' + String(101 + i), title: j[0], deptId: DEPTS.find(d => d.name === j[1])?.id || 'd1',
      location: j[2], type: j[3], exp: j[4], openings: j[5], status: j[6], postedOn: U.iso(U.addD(U.today(), -r.int(5, 70))),
      hired: j[6] === 'Closed' ? j[5] : r.int(0, Math.max(0, j[5] - 1)), recruiter: employees[4].id, budget: r.amt(600000, 2600000),
      description: 'Own ' + j[0] + ' deliverables across fitout projects. Strong communication, vendor coordination and site exposure required.'
    }));
    db.candidates = Array.from({ length: 26 }, (_, i) => {
      const job = db.jobs[i % db.jobs.length];
      return {
        id: id('CAND', i + 1), name: r.pick(NAMES) + (r.chance(.4) ? ' ' + r.pick(['Sharma', 'Nair', 'Kapoor', 'Reddy', 'Bose']) : ''), jobId: job.id, role: job.title,
        email: 'candidate' + i + '@mail.com', phone: '+91 90' + r.int(100000000, 999999999), exp: r.int(1, 12), currentCtc: r.amt(400000, 1800000),
        expectedCtc: r.amt(600000, 2400000), source: r.pick(['LinkedIn', 'Naukri', 'Referral', 'Website', 'Consultant']),
        stage: r.pick(['Applied', 'Screening', 'Interview', 'Interview', 'Offer', 'Hired', 'Rejected']), rating: r.int(2, 5),
        appliedOn: U.iso(U.addD(U.today(), -r.int(2, 50))), notice: r.pick(['Immediate', '15 days', '30 days', '60 days']),
        skills: r.some(['AutoCAD', 'Revit', 'MS Project', 'BOQ', 'MEP', 'SketchUp', 'Primavera', 'Excel', 'Leadership'], 3), resume: true,
        interviews: r.int(0, 2), location: r.pick(['Gurugram', 'Delhi', 'Noida', 'Mumbai', 'Pune'])
      };
    });
    db.trainings = [
      ['Working at Height & Fall Protection', 'QHSE', '2026-11-12', 'Internal', 24, 'Scheduled'],
      ['GFC Drawing Reading for Site Engineers', 'Technical', '2026-11-18', 'Internal', 32, 'Scheduled'],
      ['GST & TDS for Project Accountants', 'Finance', '2026-10-22', 'External', 12, 'Completed'],
      ['Primavera P6 Basics', 'Planning', '2026-12-02', 'External', 8, 'Scheduled'],
      ['POSH Awareness (Annual)', 'Compliance', '2026-09-30', 'Internal', 58, 'Completed'],
      ['Fire Safety Drill', 'QHSE', '2026-10-05', 'Internal', 44, 'Completed']
    ].map((t, i) => ({ id: id('TRN', i + 1), title: t[0], category: t[1], date: t[2], mode: t[3], seats: t[4], status: t[5], trainer: r.pick(NAMES), enrolled: r.int(3, t[4]), deptId: r.pick(DEPTS).id }));
    db.appraisals = employees.slice(0, 22).map((e, i) => ({
      id: id('APR', i + 1), employeeId: e.id, employee: e.name, cycle: 'FY 25-26 (H1)', reviewer: pmPool[i % pmPool.length].id,
      selfRating: U.round(3 + r() * 2, 1), managerRating: U.round(2.8 + r() * 2.2, 1),
      status: r.pick(['Completed', 'Completed', 'In Review', 'Pending']), dueDate: U.iso(U.addD(U.today(), r.int(-20, 25))),
      hike: r.chance(.6) ? r.int(4, 18) : 0, promotion: r.chance(.16), goals: r.int(3, 6), completed: r.int(1, 6),
      strengths: 'Delivery ownership, vendor negotiation', improve: 'Documentation discipline, cost forecasting'
    }));
    db.timesheets = Array.from({ length: 40 }, (_, i) => {
      const e = employees[r.int(0, employees.length - 1)];
      return {
        id: id('TS', i + 1), employeeId: e.id, employee: e.name, projectId: P[i % P.length].id, date: U.iso(U.addD(U.today(), -r.int(0, 14))),
        hours: r.int(4, 10), task: r.pick(['Site execution', 'Design coordination', 'Procurement follow-up', 'Client meeting', 'Measurement & certification', 'Billing']),
        billable: r.chance(.7), status: r.pick(['Approved', 'Approved', 'Pending']), approvedBy: pmPool[0].id
      };
    });

    /* ----------------------- approvals / tasks / docs -------------------- */
    db.approvals = [];
    let apSeq = 0;
    const apTemplates = [
      () => { const po = r.pick(db.pos.filter(p => p.status === 'Pending Approval') || []); return po ? { type: 'Purchase Order', ref: po.code, amount: po.total, projectId: po.projectId, entityId: po.id } : null; },
      () => { const inv = r.pick(db.invoices.filter(i => i.approval === 'Pending Approval') || []); return inv ? { type: 'Vendor Invoice', ref: inv.code, amount: inv.total, projectId: inv.projectId, entityId: inv.id } : null; },
      () => { const pr = r.pick(db.prs.filter(p => p.status === 'Pending Approval') || []); return pr ? { type: 'Purchase Request', ref: pr.code, amount: pr.estAmount, projectId: pr.projectId, entityId: pr.id } : null; },
      () => { const co = r.pick(db.changeOrders.filter(c => c.status === 'Pending') || []); return co ? { type: 'Change Order', ref: co.code, amount: co.amount, projectId: co.projectId, entityId: co.id } : null; },
      () => { const ex = r.pick(db.expenses.filter(e => e.status === 'Pending') || []); return ex ? { type: 'Expense', ref: ex.code, amount: ex.amount, projectId: ex.projectId, entityId: ex.id } : null; }
    ];
    for (let i = 0; i < 20; i++) {
      const t = apTemplates[i % apTemplates.length]();
      if (!t) continue;
      apSeq++;
      db.approvals.push({
        id: id('APR', apSeq), ...t, requestedBy: r.pick(employees).id, requestedOn: U.iso(U.addD(U.today(), -r.int(0, 8))),
        status: r.pick(['Pending', 'Pending', 'Pending', 'Approved', 'Rejected']), level: r.int(1, 2), levels: 2,
        approverId: users[r.int(0, 6)].id, sla: r.int(-2, 4), comments: '', priority: r.pick(['Normal', 'High', 'Urgent'])
      });
    }
    db.approvalRules = [
      { id: 'ar1', name: 'PO below ₹2 L — PM approval', module: 'Purchase Order', cond: 'Amount < ₹2,00,000', chain: 'Project Manager', active: true },
      { id: 'ar2', name: 'PO ₹2 L–₹10 L — PM + Procurement Head', module: 'Purchase Order', cond: '₹2,00,000 ≤ Amount < ₹10,00,000', chain: 'PM → Procurement Head', active: true },
      { id: 'ar3', name: 'PO above ₹10 L — Director', module: 'Purchase Order', cond: 'Amount ≥ ₹10,00,000', chain: 'PM → Procurement Head → Director', active: true },
      { id: 'ar4', name: 'Vendor invoice 3-way match', module: 'Vendor Invoice', cond: 'PO + GRN + Invoice match', chain: 'QS → Finance', active: true },
      { id: 'ar5', name: 'Change order client approval', module: 'Change Order', cond: 'Any amount', chain: 'QS → PM → Client', active: true },
      { id: 'ar6', name: 'Site expense > ₹25,000', module: 'Expense', cond: 'Amount > ₹25,000', chain: 'Site Eng → PM → Finance', active: true },
      { id: 'ar7', name: 'Leave > 3 days', module: 'Leave', cond: 'Days > 3', chain: 'Manager → HR', active: true }
    ];
    db.tasks = [];
    let taskSeq = 0;
    const TASK_TPL = [
      'Share revised GFC drawing with site', 'Follow up laminate sample approval', 'Verify GRN vs PO for tiles', 'Prepare client billing for milestone 3',
      'Close critical snags at reception', 'Upload DPR photos to project folder', 'Coordinate lift availability with building', 'Raise PR for pending electrical items',
      'Verify fire sprinkler as-built', 'Update BOQ executed quantities', 'Schedule HVAC testing & commissioning', 'Send weekly progress deck to client',
      'Confirm carpenter manpower for Saturday', 'Collect vendor GST invoice for Aug', 'Review subcontractor bill', 'Prepare handover checklist',
      'Update activity schedule for design change', 'Book site visit for new lead', 'Complete safety induction for new labour', 'Follow up TDS certificate'
    ];
    P.filter(p => p.status !== 'Completed').forEach(p => {
      const n = r.int(3, 6);
      for (let i = 0; i < n; i++) {
        taskSeq++;
        const due = U.addD(U.today(), r.int(-6, 12));
        db.tasks.push({
          id: id('TSK', taskSeq), projectId: p.id, title: r.pick(TASK_TPL), assigneeId: employees[r.int(0, employees.length - 1)].id,
          createdBy: p.pmId, status: r.pick(['To Do', 'In Progress', 'In Progress', 'Review', 'Done']), priority: r.pick(['Low', 'Medium', 'High', 'Critical']),
          due: U.iso(due), createdOn: U.iso(U.addD(U.today(), -r.int(1, 20))), tags: r.some(['BOQ', 'Procurement', 'Design', 'Site', 'Finance', 'Client', 'QHSE'], 2),
          comments: r.int(0, 5), attachments: r.int(0, 3), contextType: r.pick(['Drawing', 'BOQ Item', 'Order', 'Snag', 'Expense', '']),
          contextRef: r.chance(.5) ? 'B-0' + r.int(1, 9) : '', checklist: r.chance(.4) ? [{ t: 'Verify with site', done: true }, { t: 'Confirm with vendor', done: r.chance(.5) }] : []
        });
      }
    });
    db.notifications = [];
    let ntSeq = 0;
    const NT_TPL = [
      ['Approval', 'PO waiting for your approval', 'Purchase order PO/2425/0012 raised by Procurement needs Director approval.', 'warn', '/approvals'],
      ['Task', 'Task due today', 'Close critical snags at reception — assigned to you by PM.', 'info', '/tasks'],
      ['Finance', 'Invoice overdue 30+ days', '3 client invoices crossed 30 days. Follow up with accounts.', 'bad', '/finance/invoices'],
      ['HR', 'Payroll cycle opened', 'Attendance cut-off for this month is in 3 days.', 'info', '/hrm/payroll'],
      ['Project', 'Activity slipping', 'HVAC ducting is 14% behind schedule on MK-1025.', 'warn', '/projects'],
      ['System', 'Weekly MIS ready', 'Your Monday project pack has been generated.', 'ok', '/analytics']
    ];
    for (let i = 0; i < 14; i++) {
      const t = NT_TPL[i % NT_TPL.length];
      ntSeq++;
      db.notifications.push({
        id: id('NT', ntSeq), type: t[0], title: t[1], body: t[2], level: t[3], link: t[4],
        at: U.iso(U.addD(U.today(), -r.int(0, 6))) + 'T' + String(r.int(8, 19)).padStart(2, '0') + ':' + String(r.int(10, 59)) + ':00',
        read: i > 5, channel: r.pick(['In-app', 'WhatsApp', 'Email', 'In-app'])
      });
    }
    db.activityLog = [];
    let logSeq = 0;
    const LOG_TPL = [
      ['boq', 'updated BOQ quantity', 'B-03-ELE qty 420 → 468 sqft', 'Quantity Surveyor'],
      ['po', 'approved purchase order', 'PO/2425/0018 to Cool Air Systems', 'Director'],
      ['dpr', 'submitted daily progress report', 'Manpower 42 • 12% progress today', 'Site Engineer'],
      ['snag', 'closed snag', 'SN-014 — tile joint mismatch at pantry', 'Vendor'],
      ['design', 'uploaded drawing revision', 'A-201 Reflected Ceiling Plan R3', 'Designer'],
      ['invoice', 'received vendor invoice', 'VINV-0032 — ₹4.62 L', 'Finance'],
      ['hr', 'approved leave request', '2 days Earned Leave', 'HR Manager'],
      ['crm', 'moved lead to Negotiation', 'Prospect Realty — ₹2.4 Cr', 'Sales'],
      ['payment', 'released payment', '₹8.4 L to Asian Interiors Works', 'Finance'],
      ['site', 'flagged blocker', 'Lift not available for material movement', 'Site Engineer']
    ];
    for (let i = 0; i < 34; i++) {
      const t = LOG_TPL[i % LOG_TPL.length];
      logSeq++;
      db.activityLog.push({
        id: id('LOG', logSeq), module: t[0], action: t[1], detail: t[2], role: t[3],
        user: r.pick(employees).name, projectId: r.chance(.7) ? P[r.int(0, P.length - 1)].id : '',
        at: new Date(Date.now() - (i * 3600 * 1000 * r.int(1, 9))).toISOString()
      });
    }

    /* ------------------------- cost / finance ledgers ------------------- */
    db.costEntries = [];
    P.forEach(p => {
      const heads = [['Material', .42], ['Subcontract', .26], ['Labour', .16], ['Site Overheads', .06], ['Equipment', .04], ['Consultancy', .03], ['Freight', .03]];
      heads.forEach(h => {
        db.costEntries.push({ id: U.uid('CE'), projectId: p.id, head: h[0], budget: Math.round(p.budget * h[1]), committed: Math.round(p.budget * h[1] * (0.45 + r() * 0.5)), actual: Math.round(p.budget * h[1] * (0.3 + r() * 0.72)) });
      });
    });
    db.budgets = P.map(p => ({ id: U.uid('BDG'), projectId: p.id, version: 'Rev-1', amount: p.budget, approvedBy: pmPool[0].id, approvedOn: U.iso(U.addD(p.start, -5)), contingency: Math.round(p.budget * .04), status: 'Approved' }));
    db.cashflow = U.lastMonths(6).map((m, i) => ({
      key: m.key, label: m.label, full: m.full,
      inflow: r.amt(3200000, 9800000), outflow: r.amt(2800000, 8400000), collections: r.amt(2600000, 7600000), payables: r.amt(1900000, 6200000)
    }));
    db.journalEntries = [];
    let jeSeq = 0;
    for (let i = 0; i < 18; i++) {
      jeSeq++;
      const amt = r.amt(25000, 900000);
      db.journalEntries.push({
        id: id('JE', jeSeq), code: 'JV-' + String(jeSeq).padStart(4, '0'), date: U.iso(U.addD(U.today(), -r.int(0, 45))),
        narration: r.pick(['Vendor invoice booking', 'Client billing', 'Site expense booking', 'Payment release', 'Retention entry', 'TDS deduction', 'Advance adjustment']),
        debit: r.pick(['Project WIP', 'Site Expense', 'Debtors', 'Contract Cost']), credit: r.pick(['Creditors', 'Bank', 'Revenue', 'Retention Payable']),
        amount: amt, projectId: r.pick(P).id, status: 'Posted'
      });
    }
    db.compliance = [
      ['GST Return GSTR-1', 'Oct 2026', 'Filed', '2026-11-11'], ['GST Return GSTR-3B', 'Oct 2026', 'Filed', '2026-11-20'],
      ['TDS Return 26Q', 'Q2 FY26', 'Filed', '2026-10-31'], ['PF ECR', 'Oct 2026', 'Pending', '2026-11-15'],
      ['ESI Contribution', 'Oct 2026', 'Pending', '2026-11-15'], ['PT (Haryana)', 'Oct 2026', 'Filed', '2026-11-10'],
      ['Labour Licence Renewal', 'Gurugram', 'In Progress', '2026-12-31'], ['Fire NOC — Amazon BLR8', 'Bengaluru', 'Pending', '2026-11-30'],
      ['Contract Labour Register', 'All sites', 'Filed', '2026-11-05'], ['Shops & Establishment', 'Haryana', 'Filed', '2026-09-30']
    ].map((c, i) => ({ id: id('CMP', i + 1), name: c[0], period: c[1], status: c[2], dueDate: c[3], owner: r.pick(employees).id, authority: r.pick(['GSTN', 'Income Tax', 'EPFO', 'ESIC', 'Labour Dept', 'Municipal Corp']) }));
    db.subcontracts = db.vendors.slice(0, 9).map((v, i) => ({
      id: id('SC', i + 1), code: 'SC-' + String(201 + i), vendor: v.name, vendorId: v.id, projectId: P[i % P.length].id,
      scope: r.pick(['Carpentry & joinery works', 'MEP installation', 'False ceiling & partitions', 'Flooring works', 'Painting & polishing', 'Glass partitions']),
      value: r.amt(600000, 9000000), rateBasis: r.pick(['Item rate', 'Lumpsum', 'Lumpsum', 'Per sqft']), retention: 5, advance: r.amt(50000, 600000),
      start: U.iso(U.addD(U.today(), -r.int(30, 200))), end: U.iso(U.addD(U.today(), r.int(-20, 120))),
      status: r.pick(['Active', 'Active', 'Completed', 'On Hold']), progress: r.int(15, 95), billed: r.amt(100000, 4000000), paid: r.amt(50000, 3000000),
      labourCount: r.int(6, 48), complianceOk: r.chance(.8)
    }));
    db.safety = Array.from({ length: 16 }, (_, i) => ({
      id: id('HS', i + 1), projectId: P[i % P.length].id, date: U.iso(U.addD(U.today(), -r.int(0, 60))),
      type: r.pick(['Toolbox Talk', 'Safety Observation', 'Near Miss', 'Incident', 'Inspection']),
      severity: r.pick(['Low', 'Low', 'Medium', 'High']), description: r.pick(['Missing helmet observed at Level 3', 'Housekeeping required near lift lobby', 'Electrical DB left open', 'Scaffold ledger loose', 'Toolbox talk on manual handling conducted', 'Minor cut injury — first aid given']),
      status: r.pick(['Closed', 'Closed', 'Open', 'In Progress']), reportedBy: r.pick(employees).id, corrective: r.pick(['Briefed team; helmet issued', 'Debris cleared same day', 'DB locked and labelled', 'Reinforcement done and inspected'])
    }));
    db.siteMeasurements = Array.from({ length: 20 }, (_, i) => ({
      id: id('MB', i + 1), code: 'MB-' + String(500 + i), projectId: P[i % P.length].id, trade: r.pick(TRADES),
      description: r.pick(['Ceiling area measured', 'Skirting length measured', 'Partition area measured', 'Flooring area measured', 'Carpentry units counted']),
      qty: r.int(50, 2400), unit: r.pick(UNITS), date: U.iso(U.addD(U.today(), -r.int(0, 20))), status: r.pick(['Approved', 'Approved', 'Pending']),
      measuredBy: r.pick(employees).id, verifiedBy: pmPool[i % pmPool.length].id, billable: true
    }));

    /* -------------------------- integrations ---------------------------- */
    db.integrations = [
      { id: 'int1', name: 'Tally Prime', cat: 'Accounting', status: 'Connected', desc: 'Sync invoices, payments, GST and ledgers', lastSync: 'Today 09:12', icon: 'bank', color: '#1D4ED8' },
      { id: 'int2', name: 'WhatsApp Business', cat: 'Communication', status: 'Connected', desc: 'DPR, approvals and task alerts to groups', lastSync: '2 hours ago', icon: 'whatsapp', color: '#16A34A' },
      { id: 'int3', name: 'Gmail / Outlook', cat: 'Communication', status: 'Connected', desc: 'Transmittals, reminders, client packs', lastSync: 'Today 08:40', icon: 'mail', color: '#DC2626' },
      { id: 'int4', name: 'Google Drive', cat: 'Storage', status: 'Connected', desc: 'Drawing archive and photo backup', lastSync: 'Yesterday', icon: 'folder', color: '#D97706' },
      { id: 'int5', name: 'Zoho Books', cat: 'Accounting', status: 'Available', desc: 'Two-way invoice and contact sync', lastSync: '—', icon: 'sheet', color: '#0891B2' },
      { id: 'int6', name: 'Microsoft Project / P6', cat: 'Planning', status: 'Connected', desc: 'Import activity schedules (XML)', lastSync: '3 days ago', icon: 'calendar', color: '#2563EB' },
      { id: 'int7', name: 'Razorpay', cat: 'Payments', status: 'Available', desc: 'Collect client advances online', lastSync: '—', icon: 'card', color: '#7C3AED' },
      { id: 'int8', name: 'Biometric / Face ID', cat: 'HR', status: 'Connected', desc: 'Attendance device sync (eSSL / ZKTeco)', lastSync: 'Today 09:05', icon: 'cpu', color: '#0E9F6E' },
      { id: 'int9', name: 'EPFO / ESIC Portal', cat: 'HR', status: 'Available', desc: 'Bulk ECR upload, challan refs', lastSync: '—', icon: 'shield', color: '#0D9488' },
      { id: 'int10', name: 'Google Maps', cat: 'Field', status: 'Connected', desc: 'Geo-fenced attendance and site routing', lastSync: 'Live', icon: 'map', color: '#16A34A' },
      { id: 'int11', name: 'Slack / Teams', cat: 'Communication', status: 'Available', desc: 'Daily digest in your team channel', lastSync: '—', icon: 'message', color: '#4B5563' },
      { id: 'int12', name: 'OpenAI / Azure AI', cat: 'AI', status: 'Connected', desc: 'Copilot reasoning on your project data', lastSync: 'Live', icon: 'sparkles', color: '#F2540B' }
    ];
    db.webhooks = [
      { id: 'wh1', name: 'PO approved → Slack', event: 'po.approved', url: 'https://hooks.slack.com/services/T000/B000/xxxx', active: true },
      { id: 'wh2', name: 'Client portal update', event: 'progress.updated', url: 'https://api.client.example.com/mk', active: false }
    ];
    db.apiKeys = [{ id: 'k1', label: 'Tally sync (prod)', key: 'mk_live_8f2c1a...9d4b', created: '2026-04-12', lastUsed: 'Today 09:12', scopes: ['invoices:read', 'payments:write'] }];

    /* --------------------------- settings / saas ------------------------- */
    db.plans = [
      { id: 'starter', name: 'Starter', price: 7999, per: 'month', users: 15, projects: 5, modules: 'Projects, BOQ, DPR, Docs', popular: false, storage: '50 GB', features: ['Projects & BOQ', 'DPR + photos', 'Snags & RFI', 'Documents (5 versions)', 'Email support'] },
      { id: 'growth', name: 'Growth', price: 18999, per: 'month', users: 50, projects: 25, modules: 'Starter + Procurement, Finance, CRM', popular: true, storage: '250 GB', features: ['Everything in Starter', 'Procurement + GRN + 3-way match', 'Finance & client billing', 'CRM + quotations', 'Approval workflows', 'WhatsApp alerts', 'Priority support'] },
      { id: 'enterprise', name: 'Enterprise', price: 39999, per: 'month', users: 250, projects: 200, modules: 'All modules + HRM + AI Copilot', popular: false, storage: '1 TB', features: ['Everything in Growth', 'Full HRM + payroll', 'AI Copilot & risk agents', 'Multi-company / units', 'SSO + audit logs', 'Tally / SAP two-way', 'Dedicated CSM'] },
      { id: 'custom', name: 'Custom', price: 0, per: 'annual', users: 999, projects: 999, modules: 'Bespoke SLAs', popular: false, storage: 'Unlimited', features: ['Custom modules', 'On-prem / private cloud', 'Data residency (UAE / KSA / IN)', 'Dedicated implementation squad'] }
    ];
    db.subscription = { plan: 'Enterprise', seats: 58, used: 53, renewal: U.iso(U.addD(U.today(), 84)), status: 'Active', billing: 'Annual', mrr: 39999, storageUsed: 168, storageTotal: 1024, addons: ['AI Copilot', 'WhatsApp Alerts', 'Client Portal'], started: U.iso(U.addD(U.today(), -281)) };
    db.usage = { activeUsers: 41, projectsLive: 11, dprsThisMonth: 128, documents: 186, apiCalls: 24810, copilotQueries: 96 };

    return db;
  };

  /* --------- deterministic attendance generator (no storage cost) ------- */
  S.attendance = function (db, monthKey, employeeIds) {
    const [y, m] = monthKey.split('-').map(Number);
    const r = U.rng(y * 100 + m * 7 + 13);
    const days = new Date(y, m, 0).getDate();
    const out = [];
    const emps = db.employees.filter(e => employeeIds ? employeeIds.includes(e.id) : e.status !== 'Resigned');
    const t = U.today();
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, m - 1, d);
      if (date > t) break;
      const wd = date.getDay();
      emps.forEach(e => {
        let status = 'Present', inT = '09:' + String(r.int(18, 34)).padStart(2, '0'), outT = '18:' + String(r.int(25, 59)).padStart(2, '0'), hrs = 8.6;
        if (wd === 0) status = 'Weekly Off';
        else if (r.chance(.035)) status = 'Absent';
        else if (r.chance(.04)) { status = 'Leave'; inT = ''; outT = ''; hrs = 0; }
        else if (r.chance(.06)) { status = 'Half Day'; outT = '13:40'; hrs = 4; }
        else if (r.chance(.03)) { status = 'Work From Home'; }
        else if (r.chance(.05)) { status = 'Late'; inT = '10:' + String(r.int(20, 55)).padStart(2, '0'); }
        if (status === 'Absent') { inT = ''; outT = ''; hrs = 0; }
        out.push({
          id: 'ATT-' + monthKey + '-' + e.id + '-' + d, employeeId: e.id, employee: e.name, deptId: e.deptId, date: U.iso(date),
          status, in: inT, out: outT, hours: U.round(hrs, 1), shift: e.shift || 'General (09:30-18:30)',
          mode: status === 'Work From Home' ? 'WFH' : status === 'Present' || status === 'Late' ? 'Biometric' : '—',
          geo: status === 'Present' || status === 'Late' ? 'Verified' : '', ot: r.chance(.08) ? U.round(1 + r() * 3, 1) : 0
        });
      });
    }
    return out;
  };

  MK.Seed = S;
})(window.MK);

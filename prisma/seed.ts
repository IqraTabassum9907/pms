import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PurchaseFlow database with realistic enterprise data...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.purchaseReturn.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.qualityInspection.deleteMany();
  await prisma.materialReceiptItem.deleteMany();
  await prisma.materialReceipt.deleteMany();
  await prisma.logistics.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.pODispatch.deleteMany();
  await prisma.pOApproval.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.indentApproval.deleteMany();
  await prisma.purchaseIndentItem.deleteMany();
  await prisma.purchaseIndent.deleteMany();
  await prisma.material.deleteMany();
  await prisma.category.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tATConfiguration.deleteMany();
  await prisma.taxGST.deleteMany();
  await prisma.paymentTerm.deleteMany();
  await prisma.deliveryTerm.deleteMany();

  // 1. Departments
  const deptPurchase = await prisma.department.create({
    data: { code: "DEP-PUR", name: "Purchase & Procurement", headName: "Vikram Malhotra" },
  });
  const deptStore = await prisma.department.create({
    data: { code: "DEP-STR", name: "Store & Warehouse Management", headName: "Ramesh Gupta" },
  });
  const deptAccounts = await prisma.department.create({
    data: { code: "DEP-ACC", name: "Accounts & Finance", headName: "Sunita Deshmukh" },
  });
  const deptMech = await prisma.department.create({
    data: { code: "DEP-ENG", name: "Mechanical & Operations", headName: "Rajesh Sharma" },
  });
  const deptIT = await prisma.department.create({
    data: { code: "DEP-IT", name: "IT & Infrastructure", headName: "Amitabh Sen" },
  });

  // 2. Users (20 realistic users with specified demo credentials)
  const usersData = [
    { name: "Rahul Sharma (Admin)", email: "admin@purchaseflow.com", password: "Admin@123", role: "ADMIN", departmentId: deptPurchase.id, phone: "+91 98200 11223" },
    { name: "Priya Nair (Purchase Manager)", email: "manager@purchaseflow.com", password: "Manager@123", role: "PURCHASE_MANAGER", departmentId: deptPurchase.id, phone: "+91 98200 22334" },
    { name: "Amit Patel (Purchase Exec)", email: "executive@purchaseflow.com", password: "Executive@123", role: "PURCHASE_EXECUTIVE", departmentId: deptPurchase.id, phone: "+91 98200 33445" },
    { name: "Sunita Deshmukh (Accounts)", email: "accounts@purchaseflow.com", password: "Accounts@123", role: "ACCOUNTS", departmentId: deptAccounts.id, phone: "+91 98200 44556" },
    { name: "Ramesh Gupta (Store Mgr)", email: "store@purchaseflow.com", password: "Store@123", role: "STORE_MANAGER", departmentId: deptStore.id, phone: "+91 98200 55667" },
    { name: "Rajesh Sharma (Dept Head)", email: "depthead@purchaseflow.com", password: "Depthead@123", role: "DEPARTMENT_HEAD", departmentId: deptMech.id, phone: "+91 98200 66778" },
    
    // Additional staff
    { name: "Kavita Reddy", email: "kavita.r@purchaseflow.com", password: "Password@123", role: "PURCHASE_EXECUTIVE", departmentId: deptPurchase.id, phone: "+91 98200 77889" },
    { name: "Suresh Menon", email: "suresh.m@purchaseflow.com", password: "Password@123", role: "ACCOUNTS", departmentId: deptAccounts.id, phone: "+91 98200 88990" },
    { name: "Deepak Joshi", email: "deepak.j@purchaseflow.com", password: "Password@123", role: "STORE_MANAGER", departmentId: deptStore.id, phone: "+91 98200 99001" },
    { name: "Ananya Iyer", email: "ananya.i@purchaseflow.com", password: "Password@123", role: "PURCHASE_MANAGER", departmentId: deptPurchase.id, phone: "+91 98200 12345" },
    { name: "Vikas Verma", email: "vikas.v@purchaseflow.com", password: "Password@123", role: "DEPARTMENT_HEAD", departmentId: deptIT.id, phone: "+91 98200 23456" },
    { name: "Neha Saxena", email: "neha.s@purchaseflow.com", password: "Password@123", role: "PURCHASE_EXECUTIVE", departmentId: deptPurchase.id, phone: "+91 98200 34567" },
    { name: "Manish Aggarwal", email: "manish.a@purchaseflow.com", password: "Password@123", role: "ACCOUNTS", departmentId: deptAccounts.id, phone: "+91 98200 45678" },
    { name: "Pooja Hegde", email: "pooja.h@purchaseflow.com", password: "Password@123", role: "STORE_MANAGER", departmentId: deptStore.id, phone: "+91 98200 56789" },
    { name: "Alok Kumar", email: "alok.k@purchaseflow.com", password: "Password@123", role: "ADMIN", departmentId: deptPurchase.id, phone: "+91 98200 67890" },
    { name: "Ritu Singhania", email: "ritu.s@purchaseflow.com", password: "Password@123", role: "PURCHASE_EXECUTIVE", departmentId: deptPurchase.id, phone: "+91 98200 78901" },
    { name: "Tarun Kapoor", email: "tarun.k@purchaseflow.com", password: "Password@123", role: "DEPARTMENT_HEAD", departmentId: deptStore.id, phone: "+91 98200 89012" },
    { name: "Siddharth Rao", email: "siddharth.r@purchaseflow.com", password: "Password@123", role: "ACCOUNTS", departmentId: deptAccounts.id, phone: "+91 98200 90123" },
    { name: "Gaurav Mehta", email: "gaurav.m@purchaseflow.com", password: "Password@123", role: "PURCHASE_EXECUTIVE", departmentId: deptPurchase.id, phone: "+91 98200 01234" },
    { name: "Shweta Chaudhary", email: "shweta.c@purchaseflow.com", password: "Password@123", role: "STORE_MANAGER", departmentId: deptStore.id, phone: "+91 98200 11122" },
  ];

  for (const u of usersData) {
    await prisma.user.create({ data: u });
  }

  // 3. Employees
  await prisma.employee.createMany({
    data: [
      { code: "EMP-001", name: "Rahul Sharma", email: "admin@purchaseflow.com", phone: "+91 98200 11223", departmentId: deptPurchase.id, designation: "VP Procurement" },
      { code: "EMP-002", name: "Priya Nair", email: "manager@purchaseflow.com", phone: "+91 98200 22334", departmentId: deptPurchase.id, designation: "Purchase Manager" },
      { code: "EMP-003", name: "Amit Patel", email: "executive@purchaseflow.com", phone: "+91 98200 33445", departmentId: deptPurchase.id, designation: "Sr Purchase Executive" },
      { code: "EMP-004", name: "Sunita Deshmukh", email: "accounts@purchaseflow.com", phone: "+91 98200 44556", departmentId: deptAccounts.id, designation: "Finance Controller" },
      { code: "EMP-005", name: "Ramesh Gupta", email: "store@purchaseflow.com", phone: "+91 98200 55667", departmentId: deptStore.id, designation: "Head Warehouse Manager" },
    ],
  });

  // 4. Warehouses
  const whMumbai = await prisma.warehouse.create({
    data: { code: "WH-MUM", name: "Central Warehouse Mumbai", location: "Bhiwandi, Thane", address: "Plot 42, Logistics Park, Bhiwandi, MH", managerName: "Ramesh Gupta", contactPhone: "+91 98200 55667" },
  });
  const whPune = await prisma.warehouse.create({
    data: { code: "WH-PUN", name: "Plant Warehouse Pune", location: "Chakan Industrial Zone", address: "Gate 3, MIDC Phase II, Chakan, Pune", managerName: "Deepak Joshi", contactPhone: "+91 98200 99001" },
  });
  const whDelhi = await prisma.warehouse.create({
    data: { code: "WH-DEL", name: "Logistics Hub Delhi", location: "Gurugram Highway", address: "Sector 18, Udyog Vihar, Gurugram, HR", managerName: "Pooja Hegde", contactPhone: "+91 98200 56789" },
  });
  const whBlr = await prisma.warehouse.create({
    data: { code: "WH-BLR", name: "Regional Depot Bengaluru", location: "Peenya Industrial Area", address: "Phase 1, Peenya, Bengaluru, KA", managerName: "Shweta Chaudhary", contactPhone: "+91 98200 11122" },
  });
  const whGuj = await prisma.warehouse.create({
    data: { code: "WH-GUJ", name: "Factory Store Gujarat", location: "Sanand Industrial Estate", address: "GIDC Industrial Park, Sanand, Ahmedabad", managerName: "Ramesh Gupta", contactPhone: "+91 98200 55667" },
  });

  // 5. Units
  const unitKg = await prisma.unit.create({ data: { code: "KG", name: "Kilogram", symbol: "kg" } });
  const unitPcs = await prisma.unit.create({ data: { code: "PCS", name: "Pieces", symbol: "pcs" } });
  const unitMtr = await prisma.unit.create({ data: { code: "MTR", name: "Meter", symbol: "m" } });
  const unitLtr = await prisma.unit.create({ data: { code: "LTR", name: "Liter", symbol: "L" } });
  const unitBox = await prisma.unit.create({ data: { code: "BOX", name: "Box", symbol: "box" } });

  // 6. Categories
  const catRaw = await prisma.category.create({ data: { code: "CAT-RAW", name: "Industrial Raw Materials", description: "Polymers, metals, granules" } });
  const catPack = await prisma.category.create({ data: { code: "CAT-PCK", name: "Packaging Material", description: "Boxes, tapes, stretch film" } });
  const catElec = await prisma.category.create({ data: { code: "CAT-ELE", name: "Electrical & Electronics", description: "Cables, switches, breakers" } });
  const catMech = await prisma.category.create({ data: { code: "CAT-MCH", name: "Mechanical & Bearings", description: "Bearings, valves, pumps, gears" } });
  const catLub = await prisma.category.create({ data: { code: "CAT-LUB", name: "Lubricants & Oils", description: "Hydraulic oil, grease, engine oil" } });
  const catSafety = await prisma.category.create({ data: { code: "CAT-SAF", name: "Safety & PPE Equipment", description: "Helmets, gloves, safety shoes" } });
  const catChem = await prisma.category.create({ data: { code: "CAT-CHM", name: "Chemicals & Solvents", description: "Industrial solvents, adhesives" } });
  const catIT = await prisma.category.create({ data: { code: "CAT-IT", name: "IT Hardware & Equipment", description: "Monitors, networking, cables" } });
  const catOff = await prisma.category.create({ data: { code: "CAT-OFF", name: "Office Supplies", description: "Stationery, paper, toner" } });
  const catConst = await prisma.category.create({ data: { code: "CAT-CNS", name: "Building & Construction", description: "Pipes, structural steel, cement" } });

  // 7. Tax & Terms & TAT Config
  await prisma.taxGST.createMany({
    data: [
      { name: "GST 18%", rate: 18.0, cgst: 9.0, sgst: 9.0, igst: 18.0, isDefault: true },
      { name: "GST 12%", rate: 12.0, cgst: 6.0, sgst: 6.0, igst: 12.0, isDefault: false },
      { name: "GST 5%", rate: 5.0, cgst: 2.5, sgst: 2.5, igst: 5.0, isDefault: false },
      { name: "GST 28%", rate: 28.0, cgst: 14.0, sgst: 14.0, igst: 28.0, isDefault: false },
    ],
  });

  await prisma.paymentTerm.createMany({
    data: [
      { code: "NET30", name: "Net 30 Days", days: 30 },
      { code: "NET45", name: "Net 45 Days", days: 45 },
      { code: "NET60", name: "Net 60 Days", days: 60 },
      { code: "ADVANCE", name: "100% Advance Payment", days: 0 },
      { code: "NET15", name: "Net 15 Days", days: 15 },
    ],
  });

  await prisma.deliveryTerm.createMany({
    data: [
      { code: "FOR_SITE", name: "FOR Destination (Freight Paid)", description: "Vendor pays freight to delivery site" },
      { code: "EX_WORKS", name: "Ex-Works Factory", description: "Buyer arranges freight from vendor factory" },
      { code: "FOB", name: "Free On Board", description: "Vendor delivers to port/depot" },
    ],
  });

  const tatConfigs = [
    { stageKey: "INDENT_APPROVAL", stageName: "Indent Approval", days: 1, hours: 0, minutes: 0 },
    { stageKey: "QUOTATION", stageName: "Quotation Collection", days: 2, hours: 0, minutes: 0 },
    { stageKey: "VENDOR_SELECTION", stageName: "Vendor Selection", days: 1, hours: 0, minutes: 0 },
    { stageKey: "PO_APPROVAL", stageName: "PO Approval", days: 1, hours: 0, minutes: 0 },
    { stageKey: "PO_DISPATCH", stageName: "PO Dispatch", days: 0, hours: 4, minutes: 0 },
    { stageKey: "FOLLOW_UP", stageName: "Vendor Follow-Up", days: 2, hours: 0, minutes: 0 },
    { stageKey: "PAYMENT", stageName: "Payment Processing", days: 3, hours: 0, minutes: 0 },
    { stageKey: "LOGISTICS", stageName: "Logistics Arrangement", days: 1, hours: 0, minutes: 0 },
    { stageKey: "MATERIAL_RECEIPT", stageName: "Material Receipt (GRN)", days: 2, hours: 0, minutes: 0 },
  ];

  for (const tat of tatConfigs) {
    await prisma.tATConfiguration.create({ data: tat });
  }

  // 8. Vendors (15 realistic Indian companies)
  const vendorsData = [
    { code: "VEN-001", name: "ABC Industrial Supplies Pvt Ltd", contactPerson: "Rajesh Verma", email: "sales@abcindustrial.com", phone: "+91 98210 12345", address: "102 Industrial Estate, Andheri East", city: "Mumbai", state: "Maharashtra", gstNumber: "27AAACA1234A1Z5", pan: "AAACA1234A", bankName: "HDFC Bank", accountNumber: "50200012345678", ifsc: "HDFC0000123", paymentTerms: "Net 30 Days", creditDays: 30, rating: 4.8 },
    { code: "VEN-002", name: "Tata Steel Distribution Ltd", contactPerson: "Sunil Mehta", email: "orders@tatasteel.com", phone: "+91 98210 23456", address: "Tata Centre, 43 JL Nehru Road", city: "Kolkata", state: "West Bengal", gstNumber: "19AABCT0001A1Z9", pan: "AABCT0001A", bankName: "State Bank of India", accountNumber: "30123456789", ifsc: "SBIN0000001", paymentTerms: "Net 45 Days", creditDays: 45, rating: 4.9 },
    { code: "VEN-003", name: "Reliance Polymers Ltd", contactPerson: "Vikram Ambani", email: "polymers@ril.com", phone: "+91 98210 34567", address: "Reliance Corporate Park, Ghansoli", city: "Navi Mumbai", state: "Maharashtra", gstNumber: "27AABCR5555R1Z2", pan: "AABCR5555R", bankName: "ICICI Bank", accountNumber: "000405001234", ifsc: "ICIC0000004", paymentTerms: "Net 30 Days", creditDays: 30, rating: 4.7 },
    { code: "VEN-004", name: "Bharat Heavy Electricals Vendor Corp", contactPerson: "Subhash Chandra", email: "bhelsupplies@bhel.in", phone: "+91 98210 45678", address: "BHEL House, Siri Fort", city: "New Delhi", state: "Delhi", gstNumber: "07AAACB0002B1Z8", pan: "AAACB0002B", bankName: "Punjab National Bank", accountNumber: "01230021000123", ifsc: "PUNB0012300", paymentTerms: "Net 60 Days", creditDays: 60, rating: 4.6 },
    { code: "VEN-005", name: "Mahindra Logistics & Fasteners", contactPerson: "Prashant Joshi", email: "fasteners@mahindra.com", phone: "+91 98210 56789", address: "Mahindra Towers, Worli", city: "Mumbai", state: "Maharashtra", gstNumber: "27AAACM9999M1Z1", pan: "AAACM9999M", bankName: "Axis Bank", accountNumber: "91201001234567", ifsc: "UTIB0000012", paymentTerms: "Net 30 Days", creditDays: 30, rating: 4.5 },
    { code: "VEN-006", name: "Godrej Industrial Packaging Ltd", contactPerson: "Anish Godrej", email: "packaging@godrej.com", phone: "+91 98210 67890", address: "Pirojshanagar, Vikhroli East", city: "Mumbai", state: "Maharashtra", gstNumber: "27AAACG1111G1Z4", pan: "AAACG1111G", bankName: "Kotak Mahindra Bank", accountNumber: "1234567890", ifsc: "KKBK0000123", paymentTerms: "Net 15 Days", creditDays: 15, rating: 4.4 },
    { code: "VEN-007", name: "Finolex Cables & Wires", contactPerson: "Milind Chhabria", email: "cables@finolex.com", phone: "+91 98210 78901", address: "26/27 Mumbai-Pune Road, Pimpri", city: "Pune", state: "Maharashtra", gstNumber: "27AAACF3333F1Z7", pan: "AAACF3333F", bankName: "Bank of Baroda", accountNumber: "01230200000123", ifsc: "BARB0PIMPRI", paymentTerms: "Net 30 Days", creditDays: 30, rating: 4.7 },
    { code: "VEN-008", name: "SKF Bearings India Ltd", contactPerson: "Siddharth Roy", email: "sales@skfindia.com", phone: "+91 98210 89012", address: "Chinchwad, Pune", city: "Pune", state: "Maharashtra", gstNumber: "27AAACS4444S1Z3", pan: "AAACS4444S", bankName: "Standard Chartered", accountNumber: "22005001234", ifsc: "SCBL0036001", paymentTerms: "Net 45 Days", creditDays: 45, rating: 4.9 },
    { code: "VEN-009", name: "Shell Lubricants India Pvt Ltd", contactPerson: "Nitin Gadkari", email: "lubricants@shell.co.in", phone: "+91 98210 90123", address: "Bandrika Complex, BKC", city: "Mumbai", state: "Maharashtra", gstNumber: "27AAACS8888S1Z0", pan: "AAACS8888S", bankName: "HSBC Bank", accountNumber: "002123456001", ifsc: "HSBC0400002", paymentTerms: "Net 30 Days", creditDays: 30, rating: 4.6 },
    { code: "VEN-010", name: "Supreme Petrochem Ltd", contactPerson: "Rakesh Taparia", email: "sales@supremepetrochem.com", phone: "+91 98210 01234", address: "Solitaire Corporate Park, Chakala", city: "Mumbai", state: "Maharashtra", gstNumber: "27AAACS7777S1Z6", pan: "AAACS7777S", bankName: "Union Bank of India", accountNumber: "312301010012345", ifsc: "UBIN0531235", paymentTerms: "Net 30 Days", creditDays: 30, rating: 4.3 },
    { code: "VEN-011", name: "Pidilite Industrial Products", contactPerson: "Harish Parekh", email: "industrial@pidilite.com", phone: "+91 98211 12345", address: "Ramkrishna Mandir Road, Andheri E", city: "Mumbai", state: "Maharashtra", gstNumber: "27AAACP2222P1Z1", pan: "AAACP2222P", bankName: "HDFC Bank", accountNumber: "50200098765432", ifsc: "HDFC0000060", paymentTerms: "Net 15 Days", creditDays: 15, rating: 4.8 },
    { code: "VEN-012", name: "Asian Paints Technical Coatings", contactPerson: "Sanjay Dani", email: "coatings@asianpaints.com", phone: "+91 98211 23456", address: "6A Shantinagar, Santacruz W", city: "Mumbai", state: "Maharashtra", gstNumber: "27AAACA5555A1Z8", pan: "AAACA5555A", bankName: "ICICI Bank", accountNumber: "000405009999", ifsc: "ICIC0000004", paymentTerms: "Net 30 Days", creditDays: 30, rating: 4.7 },
    { code: "VEN-013", name: "Schneider Electric India", contactPerson: "Anil Chaudhry", email: "order@se.com", phone: "+91 98211 34567", address: "DLF Cyber City, Phase II", city: "Gurugram", state: "Haryana", gstNumber: "06AAACS6666S1Z9", pan: "AAACS6666S", bankName: "CitiBank N.A.", accountNumber: "0345123009", ifsc: "CITI0000002", paymentTerms: "Net 45 Days", creditDays: 45, rating: 4.9 },
    { code: "VEN-014", name: "Honeywell Safety Equipment Ltd", contactPerson: "Vikas Chadha", email: "safety@honeywell.com", phone: "+91 98211 45678", address: "Electra Tower, Hadapsar", city: "Pune", state: "Maharashtra", gstNumber: "27AAACH8888H1Z4", pan: "AAACH8888H", bankName: "HDFC Bank", accountNumber: "50200055544433", ifsc: "HDFC0000123", paymentTerms: "Net 30 Days", creditDays: 30, rating: 4.5 },
    { code: "VEN-015", name: "Larsen & Toubro Industrial Components", contactPerson: "SN Subrahmanyan", email: "lntcomp@lntebg.com", phone: "+91 98211 56789", address: "L&T House, Ballard Estate", city: "Mumbai", state: "Maharashtra", gstNumber: "27AAACL1111L1Z0", pan: "AAACL1111L", bankName: "State Bank of India", accountNumber: "10234567890", ifsc: "SBIN0000300", paymentTerms: "Net 60 Days", creditDays: 60, rating: 4.95 },
  ];

  const vendors = [];
  for (const v of vendorsData) {
    vendors.push(await prisma.vendor.create({ data: v }));
  }

  // 9. Materials (50 items specified in prompt)
  const materialsSeed = [
    { code: "MAT-001", name: "HDPE Granules Grade 100", categoryId: catRaw.id, unitId: unitKg.id, estimatedRate: 125.0, reorderLevel: 2000 },
    { code: "MAT-002", name: "Corrugated Boxes 5-Ply Heavy", categoryId: catPack.id, unitId: unitPcs.id, estimatedRate: 45.0, reorderLevel: 1000 },
    { code: "MAT-003", name: "Packaging Stretch Film 23 Micron", categoryId: catPack.id, unitId: unitKg.id, estimatedRate: 180.0, reorderLevel: 500 },
    { code: "MAT-004", name: "Lubricant Oil 20W40 High Temp", categoryId: catLub.id, unitId: unitLtr.id, estimatedRate: 280.0, reorderLevel: 400 },
    { code: "MAT-005", name: "Stainless Steel Sheets 304 (2mm)", categoryId: catRaw.id, unitId: unitKg.id, estimatedRate: 310.0, reorderLevel: 1500 },
    { code: "MAT-006", name: "Armored Electrical Cable 4-Core 16sqmm", categoryId: catElec.id, unitId: unitMtr.id, estimatedRate: 420.0, reorderLevel: 300 },
    { code: "MAT-007", name: "Deep Groove Ball Bearings 6205-2RS", categoryId: catMech.id, unitId: unitPcs.id, estimatedRate: 350.0, reorderLevel: 250 },
    { code: "MAT-008", name: "Industrial Safety Gloves Nitrile Coated", categoryId: catSafety.id, unitId: unitPcs.id, estimatedRate: 85.0, reorderLevel: 500 },
    { code: "MAT-009", name: "PVC Heavy Duty Pressure Pipes 110mm", categoryId: catConst.id, unitId: unitMtr.id, estimatedRate: 260.0, reorderLevel: 400 },
    { code: "MAT-010", name: "Industrial Solvent Acetone 99%", categoryId: catChem.id, unitId: unitLtr.id, estimatedRate: 140.0, reorderLevel: 1000 },
    { code: "MAT-011", name: "Polypropylene (PP) Random Polymer", categoryId: catRaw.id, unitId: unitKg.id, estimatedRate: 135.0, reorderLevel: 1500 },
    { code: "MAT-012", name: "Bopp Adhesive Tapes 48mm Brown", categoryId: catPack.id, unitId: unitPcs.id, estimatedRate: 32.0, reorderLevel: 800 },
    { code: "MAT-013", name: "Hydraulic Oil Grade 68 Anti-Wear", categoryId: catLub.id, unitId: unitLtr.id, estimatedRate: 220.0, reorderLevel: 600 },
    { code: "MAT-014", name: "Mild Steel Angles 50x50x5mm", categoryId: catRaw.id, unitId: unitKg.id, estimatedRate: 68.0, reorderLevel: 3000 },
    { code: "MAT-015", name: "MCB 3-Pole 32A C-Curve Breaker", categoryId: catElec.id, unitId: unitPcs.id, estimatedRate: 650.0, reorderLevel: 100 },
    { code: "MAT-016", name: "Taper Roller Bearings 32210", categoryId: catMech.id, unitId: unitPcs.id, estimatedRate: 1200.0, reorderLevel: 80 },
    { code: "MAT-017", name: "Safety Helmet Class E Ratchet", categoryId: catSafety.id, unitId: unitPcs.id, estimatedRate: 380.0, reorderLevel: 150 },
    { code: "MAT-018", name: "Synthetic Resin Adhesive Emulsion", categoryId: catChem.id, unitId: unitKg.id, estimatedRate: 210.0, reorderLevel: 400 },
    { code: "MAT-019", name: "24-Inch Full HD IPS Monitor", categoryId: catIT.id, unitId: unitPcs.id, estimatedRate: 9800.0, reorderLevel: 20 },
    { code: "MAT-020", name: "A4 Printing Paper 80GSM (Rim)", categoryId: catOff.id, unitId: unitBox.id, estimatedRate: 1350.0, reorderLevel: 50 },
  ];

  // Add 30 more items dynamically to hit 50
  for (let i = 21; i <= 50; i++) {
    materialsSeed.push({
      code: `MAT-${String(i).padStart(3, "0")}`,
      name: `Industrial Component Spec #${i} - Standard Metal/Plastic Part`,
      categoryId: i % 2 === 0 ? catRaw.id : catMech.id,
      unitId: i % 3 === 0 ? unitPcs.id : unitKg.id,
      estimatedRate: 100 + i * 15,
      reorderLevel: 100 + i * 10,
    });
  }

  const materials = [];
  for (const m of materialsSeed) {
    materials.push(await prisma.material.create({ data: { ...m, description: `${m.name} - Premium Quality Enterprise Standard` } }));
  }

  // 10. Seed Initial Inventories across Warehouses (50 records)
  for (const mat of materials) {
    const opening = 200 + Math.floor(Math.random() * 800);
    const received = 100 + Math.floor(Math.random() * 400);
    const issued = 50 + Math.floor(Math.random() * 200);
    const reserved = 20;
    const available = opening + received - issued - reserved;

    await prisma.inventory.create({
      data: {
        materialId: mat.id,
        warehouseId: whMumbai.id,
        sku: `SKU-${mat.code}-MUM`,
        openingStock: opening,
        receivedStock: received,
        issuedStock: issued,
        reservedStock: reserved,
        availableStock: available,
        reorderLevel: mat.reorderLevel,
        unitId: mat.unitId,
      },
    });
  }

  // 11. Purchase Indents (30 Indents)
  const indentStatuses = ["SUBMITTED", "APPROVED", "APPROVED", "UNDER_REVIEW", "REJECTED", "DRAFT"];
  const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  const indents = [];
  for (let i = 1; i <= 30; i++) {
    const date = new Date(Date.now() - (30 - i) * 86400000);
    const reqDate = new Date(date.getTime() + 7 * 86400000);
    const status = indentStatuses[i % indentStatuses.length];
    const prio = priorities[i % priorities.length];

    const mat1 = materials[i % materials.length];
    const mat2 = materials[(i + 3) % materials.length];

    const qty1 = 100 + i * 10;
    const qty2 = 50 + i * 5;
    const totalEst = qty1 * mat1.estimatedRate + qty2 * mat2.estimatedRate;

    const ind = await prisma.purchaseIndent.create({
      data: {
        indentNo: `IND-2026-${String(i).padStart(4, "0")}`,
        indentDate: date,
        departmentId: i % 2 === 0 ? deptMech.id : deptStore.id,
        requestedById: "EMP-003",
        requestedByName: "Amit Patel",
        requiredDate: reqDate,
        priority: prio,
        purpose: `Quarterly stock replenishment for production batch #${200 + i}`,
        remarks: "Urgent material requirement for plant execution.",
        status: status,
        totalEstimatedAmount: totalEst,
        plannedDate: new Date(date.getTime() + 86400000), // +1 day TAT
        actualDate: status === "APPROVED" ? new Date(date.getTime() + 86400000) : null,
        items: {
          create: [
            { materialId: mat1.id, description: mat1.name, quantity: qty1, unitId: mat1.unitId, estimatedRate: mat1.estimatedRate, estimatedAmount: qty1 * mat1.estimatedRate },
            { materialId: mat2.id, description: mat2.name, quantity: qty2, unitId: mat2.unitId, estimatedRate: mat2.estimatedRate, estimatedAmount: qty2 * mat2.estimatedRate },
          ],
        },
        approvals: {
          create: status === "APPROVED" ? [
            { actionBy: "Rajesh Sharma", actionRole: "DEPARTMENT_HEAD", action: "APPROVED", comments: "Approved for procurement." },
            { actionBy: "Priya Nair", actionRole: "PURCHASE_MANAGER", action: "APPROVED", comments: "Verified budget allotment." }
          ] : [],
        },
      },
    });
    indents.push(ind);
  }

  // 12. Quotations (40 records for approved indents)
  const approvedIndents = indents.filter((ind) => ind.status === "APPROVED");
  const quotations = [];

  for (let q = 1; q <= 40; q++) {
    const ind = approvedIndents[q % approvedIndents.length];
    const ven = vendors[q % vendors.length];

    const qTotal = ind.totalEstimatedAmount * (0.9 + (q % 5) * 0.03);

    const quote = await prisma.quotation.create({
      data: {
        quotationNo: `QUO-2026-${String(q).padStart(4, "0")}`,
        quotationDate: new Date(ind.indentDate.getTime() + 86400000),
        vendorId: ven.id,
        indentId: ind.id,
        validUntil: new Date(Date.now() + 30 * 86400000),
        paymentTerms: ven.paymentTerms,
        deliveryTerms: "FOR Destination (Freight Paid)",
        freight: 1500,
        taxAmount: qTotal * 0.18,
        discountAmount: qTotal * 0.05,
        totalAmount: qTotal * 1.13,
        remarks: "Best competitive commercial quote.",
        status: q % 3 === 0 ? "SELECTED" : "RECEIVED",
        items: {
          create: [
            { materialId: materials[q % materials.length].id, quantity: 100, rate: materials[q % materials.length].estimatedRate * 0.95, discountPercent: 5, gstPercent: 18, amount: 100 * materials[q % materials.length].estimatedRate * 0.9, total: 100 * materials[q % materials.length].estimatedRate * 0.9 * 1.18 }
          ],
        },
      },
    });
    quotations.push(quote);
  }

  // 13. Purchase Orders (25 POs)
  const poStatuses = ["APPROVED", "APPROVED", "COMPLETED", "IN_PROGRESS", "SENT", "PENDING_APPROVAL", "PARTIALLY_COMPLETED"];
  const pos = [];

  for (let p = 1; p <= 25; p++) {
    const ven = vendors[p % vendors.length];
    const ind = approvedIndents[p % approvedIndents.length];
    const quo = quotations[p % quotations.length];
    const status = poStatuses[p % poStatuses.length];

    const mat1 = materials[p % materials.length];
    const qty1 = 200 + p * 10;
    const rate1 = mat1.estimatedRate;
    const lineTotal1 = qty1 * rate1;
    const gstAmt = lineTotal1 * 0.18;
    const grandTotal = lineTotal1 + gstAmt + 2000;

    const poDate = new Date(Date.now() - (25 - p) * 86400000 * 2);
    const expDelDate = new Date(poDate.getTime() + 10 * 86400000);

    const po = await prisma.purchaseOrder.create({
      data: {
        poNo: `PO-2026-${String(p).padStart(4, "0")}`,
        poDate: poDate,
        vendorId: ven.id,
        indentId: ind.id,
        quotationId: quo.id,
        departmentId: deptPurchase.id,
        deliveryAddress: "Central Warehouse Mumbai, Plot 42, Bhiwandi, Thane, MH",
        billingAddress: "Headquarters, PurchaseFlow Corp, Worli, Mumbai 400018",
        paymentTerms: ven.paymentTerms,
        deliveryTerms: "FOR Destination",
        expectedDeliveryDate: expDelDate,
        freight: 2000,
        discount: lineTotal1 * 0.05,
        gstAmount: gstAmt,
        otherCharges: 0,
        grandTotal: grandTotal,
        status: status,
        approvalLevel: status === "PENDING_APPROVAL" ? 1 : 4,
        plannedDate: new Date(poDate.getTime() + 86400000),
        actualDate: status !== "PENDING_APPROVAL" ? new Date(poDate.getTime() + 86400000) : null,
        items: {
          create: [
            { materialId: mat1.id, description: mat1.name, quantity: qty1, unitId: mat1.unitId, rate: rate1, discountPercent: 5, gstPercent: 18, gstAmount: gstAmt, totalAmount: lineTotal1 + gstAmt },
          ],
        },
        approvals: {
          create: status !== "PENDING_APPROVAL" ? [
            { level: 1, actionBy: "Priya Nair", actionRole: "PURCHASE_MANAGER", action: "APPROVED", comments: "PO lines verified." },
            { level: 2, actionBy: "Rajesh Sharma", actionRole: "DEPARTMENT_HEAD", action: "APPROVED", comments: "Budget verified." },
            { level: 3, actionBy: "Sunita Deshmukh", actionRole: "ACCOUNTS", action: "APPROVED", comments: "Payment terms cleared." },
            { level: 4, actionBy: "Rahul Sharma", actionRole: "ADMIN", action: "APPROVED", comments: "Final executive clearance granted." },
          ] : [],
        },
        dispatches: {
          create: status !== "PENDING_APPROVAL" ? [
            { dispatchMethod: "EMAIL", recipientEmail: ven.email, recipientContact: ven.phone, message: "Purchase order dispatched to vendor.", status: "ACKNOWLEDGED" }
          ] : [],
        },
      },
    });
    pos.push(po);
  }

  // 14. Vendor Follow-ups (15 records)
  for (let f = 1; f <= 15; f++) {
    const po = pos[f % pos.length];
    await prisma.followUp.create({
      data: {
        poId: po.id,
        vendorId: po.vendorId,
        followUpDate: new Date(po.poDate.getTime() + 3 * 86400000),
        nextFollowUpDate: new Date(Date.now() + 2 * 86400000),
        daysPending: 2,
        status: f % 2 === 0 ? "COMPLETED" : "PENDING",
        remarks: "Vendor confirmed dispatch expected by weekend.",
        actionTaken: "CALL",
        createdByName: "Amit Patel",
      },
    });
  }

  // 15. Payments (20 Payment records)
  const payStatuses = ["PAID", "PAID", "PARTIALLY_PAID", "PENDING", "OVERDUE"];
  for (let k = 1; k <= 20; k++) {
    const po = pos[k % pos.length];
    const status = payStatuses[k % payStatuses.length];
    const invAmt = po.grandTotal;
    const paid = status === "PAID" ? invAmt : status === "PARTIALLY_PAID" ? invAmt * 0.5 : 0;
    const bal = invAmt - paid;

    const pay = await prisma.payment.create({
      data: {
        paymentNo: `PAY-2026-${String(k).padStart(4, "0")}`,
        poId: po.id,
        vendorId: po.vendorId,
        invoiceNo: `INV-${po.poNo.replace("PO-", "")}`,
        invoiceDate: new Date(po.poDate.getTime() + 4 * 86400000),
        invoiceAmount: invAmt,
        paidAmount: paid,
        balanceAmount: bal,
        dueDate: new Date(po.poDate.getTime() + 30 * 86400000),
        status: status,
      },
    });

    if (paid > 0) {
      await prisma.paymentTransaction.create({
        data: {
          paymentId: pay.id,
          amount: paid,
          paymentDate: new Date(po.poDate.getTime() + 10 * 86400000),
          paymentMethod: "NEFT",
          transactionRef: `HDFCNEFT98765${k}`,
          remarks: "Electronic bank transfer processed.",
          createdByName: "Sunita Deshmukh",
        },
      });
    }
  }

  // 16. Logistics (20 records)
  const logStatuses = ["DELIVERED", "DELIVERED", "IN_TRANSIT", "DISPATCHED", "VEHICLE_ASSIGNED"];
  for (let l = 1; l <= 20; l++) {
    const po = pos[l % pos.length];
    const logStat = logStatuses[l % logStatuses.length];
    await prisma.logistics.create({
      data: {
        poId: po.id,
        vendorId: po.vendorId,
        dispatchDate: new Date(po.poDate.getTime() + 5 * 86400000),
        vehicleNo: `MH-${12 + (l % 10)} AB ${1000 + l}`,
        vehicleType: "14-Ft Container Truck",
        transporter: "VRL Logistics Ltd",
        driverName: "Suresh Kumar",
        driverPhone: "+91 98920 12345",
        freight: 2000,
        expectedArrival: new Date(po.poDate.getTime() + 8 * 86400000),
        trackingNo: `VRL-TRK-900${l}`,
        status: logStat,
      },
    });
  }

  // 17. Material Receipts (GRN) & Quality Check (30 GRNs)
  for (let g = 1; g <= 30; g++) {
    const po = pos[g % pos.length];
    const grnDate = new Date(po.poDate.getTime() + 7 * 86400000);

    const grn = await prisma.materialReceipt.create({
      data: {
        grnNo: `GRN-2026-${String(g).padStart(4, "0")}`,
        poId: po.id,
        vendorId: po.vendorId,
        receiptDate: grnDate,
        warehouseId: whMumbai.id,
        vehicleNo: `MH-12 AB ${1000 + g}`,
        invoiceNo: `INV-${po.poNo.replace("PO-", "")}`,
        receivedByName: "Ramesh Gupta",
        remarks: "Materials received in full condition.",
        status: "COMPLETED",
        items: {
          create: [
            { materialId: materials[g % materials.length].id, orderedQty: 200, receivedQty: 200, acceptedQty: 195, rejectedQty: 5, damagedQty: 5, batchNo: `BATCH-2026-${g}`, remarks: "5 pcs damaged during transport." }
          ],
        },
      },
    });

    await prisma.qualityInspection.create({
      data: {
        receiptId: grn.id,
        materialId: materials[g % materials.length].id,
        batchNo: `BATCH-2026-${g}`,
        inspectedQty: 200,
        passedQty: 195,
        failedQty: 5,
        inspectionDate: new Date(grnDate.getTime() + 86400000),
        inspectorName: "Deepak Joshi",
        qualityStatus: "PASSED",
        remarks: "195 units passed quality inspection standard ISO-9001.",
      },
    });
  }

  // 18. Audit Logs & Notifications
  await prisma.auditLog.createMany({
    data: [
      { userEmail: "manager@purchaseflow.com", userName: "Priya Nair", userRole: "PURCHASE_MANAGER", action: "Approved Indent", entity: "PurchaseIndent", entityId: "IND-2026-0001", previousStatus: "SUBMITTED", newStatus: "APPROVED", details: "Approved indent after budget verification." },
      { userEmail: "executive@purchaseflow.com", userName: "Amit Patel", userRole: "PURCHASE_EXECUTIVE", action: "Created Purchase Order", entity: "PurchaseOrder", entityId: "PO-2026-0001", previousStatus: "DRAFT", newStatus: "PENDING_APPROVAL", details: "Submitted PO for multi-level approval." },
      { userEmail: "admin@purchaseflow.com", userName: "Rahul Sharma", userRole: "ADMIN", action: "Final PO Approval", entity: "PurchaseOrder", entityId: "PO-2026-0001", previousStatus: "PENDING_APPROVAL", newStatus: "APPROVED", details: "Executive level 4 clearance provided." },
      { userEmail: "store@purchaseflow.com", userName: "Ramesh Gupta", userRole: "STORE_MANAGER", action: "Created GRN", entity: "MaterialReceipt", entityId: "GRN-2026-0001", previousStatus: "PENDING", newStatus: "COMPLETED", details: "Material received and stock updated." },
      { userEmail: "accounts@purchaseflow.com", userName: "Sunita Deshmukh", userRole: "ACCOUNTS", action: "Processed Payment", entity: "Payment", entityId: "PAY-2026-0001", previousStatus: "PENDING", newStatus: "PAID", details: "Processed NEFT transaction HDFCNEFT987651." },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { title: "PO-2026-0004 awaiting approval", message: "Purchase Order PO-2026-0004 requires Level 2 approval.", type: "URGENT", recipientRole: "DEPARTMENT_HEAD", linkUrl: "/purchase/po-approval" },
      { title: "Payment Overdue for ABC Industrial", message: "Invoice INV-2026-0005 of ₹2,45,000 is overdue by 5 days.", type: "WARNING", recipientRole: "ACCOUNTS", linkUrl: "/purchase/payment" },
      { title: "Material Received for PO-2026-0008", message: "GRN-2026-0008 created by Ramesh Gupta at Central Warehouse.", type: "INFO", recipientRole: "PURCHASE_MANAGER", linkUrl: "/purchase/receipt" },
      { title: "Vendor Follow-Up Due", message: "Follow-up due today for Tata Steel (PO-2026-0012).", type: "INFO", recipientRole: "PURCHASE_EXECUTIVE", linkUrl: "/purchase/follow-up" },
    ],
  });

  console.log("PurchaseFlow seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

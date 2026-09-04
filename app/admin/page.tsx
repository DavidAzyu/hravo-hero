'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient as SC } from '@supabase/supabase-js';
import { Html5Qrcode } from 'html5-qrcode';

// SINGLETON SUPABASE - fixes GoTrueClient multiple instances warning
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = SC(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const getSupabase = () => supabase;

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

const verifyAdminPassword = async (pw: string): Promise<'ok' | 'bad' | 'unconfigured'> => {
  try {
    const { data, error } = await supabase.rpc('verify_admin_password', { p_password: pw });
    if (!error) return data === true ? 'ok' : 'bad';
  } catch {}
  if (ADMIN_PASSWORD !== '') {
    return pw === ADMIN_PASSWORD ? 'ok' : 'bad';
  }
  return 'unconfigured';
};

const readLocalList = (key: string, fallback: any[] = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalList = (key: string, value: any[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export default function AdminPage() {
  const [tab, setTab] = useState('dash');
  const [cat, setCat] = useState('bike');
  const [vCat, setVCat] = useState('bike');
  const [inv, setInv] = useState<any[]>([]);
  const [veh, setVeh] = useState<any[]>([]);
  const [list, setList] = useState<any[]>([]);
  const [cashList, setCashList] = useState<any[]>([]);
  const [cust, setCust] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [service, setService] = useState<any[]>([]);
  const [insure, setInsure] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [qr, setQr] = useState('');
  const [mode, setMode] = useState('in');
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = "qr-reader-full";
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    try {
      return window.localStorage.getItem('honda_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ tb: string; id: string; } | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('150');
  const [pQty, setPQty] = useState('1');
  const [outId, setOutId] = useState('');
  const [outQty, setOutQty] = useState('1');
  const [vModel, setVModel] = useState('');
  const [vChassis, setVChassis] = useState('');
  const [vEngine, setVEngine] = useState('');
  const [vColor, setVColor] = useState('Black');
  const [vPrice, setVPrice] = useState('');
  const [vQty, setVQty] = useState('1');
  const [vImage, setVImage] = useState('');
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cAddr, setCAddr] = useState('');
  const [cModel, setCModel] = useState('');
  const [cChassis, setCChassis] = useState('');
  const [cEngine, setCEngine] = useState('');
  const [cColor, setCColor] = useState('');
  const [cTotal, setCTotal] = useState('');
  const [cAdv, setCAdv] = useState('');
  const [cPay, setCPay] = useState('Cash');
  const [sName, setSName] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sRole, setSRole] = useState('Manager');
  const [sSal, setSSal] = useState('');
  const [sAddr, setSAddr] = useState('');
  const [sPass, setSPass] = useState('');
  const [showStaffPass, setShowStaffPass] = useState<string | null>(null);
  const [cashR, setCashR] = useState('');
  const [cashA, setCashA] = useState('');
  const [cashT, setCashT] = useState('lut');
  const [cashM, setCashM] = useState('Cash');
  const [svName, setSvName] = useState('');
  const [svPhone, setSvPhone] = useState('');
  const [svModel, setSvModel] = useState('');
  const [svChassis, setSvChassis] = useState('');
  const [svType, setSvType] = useState('General Service');
  const [svDate, setSvDate] = useState('');
  const [svAmt, setSvAmt] = useState('500');
  const [inName, setInName] = useState('');
  const [inPhone, setInPhone] = useState('');
  const [inModel, setInModel] = useState('');
  const [inPolicy, setInPolicy] = useState('');
  const [inCompany, setInCompany] = useState('HDFC ERGO');
  const [inStart, setInStart] = useState('');
  const [inEnd, setInEnd] = useState('');
  const [inAmt, setInAmt] = useState('2500');
  const [completePrice, setCompletePrice] = useState('500');
  const [completingService, setCompletingService] = useState<any>(null);
  const [showPartConfirm, setShowPartConfirm] = useState(false);
  const [pendingPart, setPendingPart] = useState<any>(null);
  
  // SETTINGS - DELETE LOCK
  const [formSub, setFormSub] = useState('customer');
  const [recordSub, setRecordSub] = useState('customers');
  const [financeJournal, setFinanceJournal] = useState<any[]>([]);
  const [capitalList, setCapitalList] = useState<any[]>([]);
  const [loansList, setLoansList] = useState<any[]>([]);
  const [loanPayments, setLoanPayments] = useState<any[]>([]);
  const [vendorPayables, setVendorPayables] = useState<any[]>([]);
  const [expensesList, setExpensesList] = useState<any[]>([]);
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [financeSub, setFinanceSub] = useState('dashboard');
  // Capital form
  const [capType, setCapType] = useState('capital_in');
  const [capAmount, setCapAmount] = useState('');
  const [capSource, setCapSource] = useState('Owner');
  const [capDesc, setCapDesc] = useState('');
  // Loan form
  const [loanLender, setLoanLender] = useState('');
  const [loanType, setLoanType] = useState('Bank');
  const [loanPrincipal, setLoanPrincipal] = useState('');
  const [loanInterest, setLoanInterest] = useState('12');
  const [loanTenure, setLoanTenure] = useState('12');
  const [loanEmi, setLoanEmi] = useState('');
  // Loan payment
  const [payLoanId, setPayLoanId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  // Payable
  const [vpName, setVpName] = useState('');
  const [vpType, setVpType] = useState('Hero Company');
  const [vpTotal, setVpTotal] = useState('');
  const [vpPaid, setVpPaid] = useState('0');
  // Expense
  const [exCat, setExCat] = useState('Rent');
  const [exDesc, setExDesc] = useState('');
  const [exAmount, setExAmount] = useState('');
  // Asset
  const [assetName, setAssetName] = useState('');
  const [assetCat, setAssetCat] = useState('Furniture');
  const [assetCost, setAssetCost] = useState('');

  const [financeFilter, setFinanceFilter] = useState<'all'|'sale'|'purchase'|'salary'|'expense'|'service'>('all');
  const [manualFinance, setManualFinance] = useState({type:'sale', category:'General', reason:'', amount:'', payment:'Cash'});
  const [settingsPass, setSettingsPass] = useState('');
  const [dueResetPhone, setDueResetPhone] = useState('');
  const [dueResetAmount, setDueResetAmount] = useState('0');
  const [settingsUnlocked, setSettingsUnlocked] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState<string | null>(null);
  // BILLS
  const [billsList, setBillsList] = useState<any[]>([]);
  const [billSub, setBillSub] = useState('create');
  const [businessInfo, setBusinessInfo] = useState({ name: 'HRAVO HERO', gstin: '15ABCDE1234F1Z5', address: 'Saiha, Mizoram - 796901', phone: '9862xxxxxx', email: 'hravohero@gmail.com', state: 'Mizoram', invoicePrefix: 'HRAVO', stateCode: '15' });
  const [billType, setBillType] = useState('vehicle_sale');
  const [billCustomerName, setBillCustomerName] = useState('');
  const [billCustomerPhone, setBillCustomerPhone] = useState('');
  const [billCustomerAddr, setBillCustomerAddr] = useState('');
  const [billCustomerGstin, setBillCustomerGstin] = useState('');
  const [billVehicleModel, setBillVehicleModel] = useState('');
  const [billChassis, setBillChassis] = useState('');
  const [billEngine, setBillEngine] = useState('');
  const [billItems, setBillItems] = useState<any[]>([{ desc: 'Hero Splendor Plus', hsn: '8711', qty: 1, rate: 85000, amount: 85000 }]);
  const [billDiscount, setBillDiscount] = useState('0');
  const [billGstPercent, setBillGstPercent] = useState('18');
  const [billPaid, setBillPaid] = useState('');
  const [billPaymentMode, setBillPaymentMode] = useState('Cash');
  const [billNotes, setBillNotes] = useState('Thank you!');
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showBillPrint, setShowBillPrint] = useState(false);

  // OCR STATE
  const [ocrText, setOcrText] = useState('');
  const [scanStatus, setScanStatus] = useState('Ready');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isStartingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const ocrWorkerRef = useRef<any>(null);
  const [ocrReady, setOcrReady] = useState(false);

  const load = async () => {
    const sup = getSupabase();

    try {
      const a = await sup.from('inventory').select('*').order('created_at', { ascending: false });
      if (a.data) setInv(a.data); else setInv(readLocalList('hravo_inventory'));
    } catch {
      setInv(readLocalList('hravo_inventory'));
    }

    try {
      const b = await sup.from('vehicle_inventory').select('*').order('created_at', { ascending: false });
      if (b.data) setVeh(b.data); else setVeh(readLocalList('hravo_vehicle_inventory'));
    } catch {
      setVeh(readLocalList('hravo_vehicle_inventory'));
    }

    try {
      const c = await sup.from('transactions').select('*').order('created_at', { ascending: false });
      if (c.data) setList(c.data); else setList(readLocalList('hravo_transactions'));
    } catch {
      setList(readLocalList('hravo_transactions'));
    }

    try {
      const r = await sup.from('ride_bookings').select('*').order('created_at', { ascending: false });
      if (r.data) setRides(r.data); else setRides(readLocalList('hravo_ride_bookings'));
    } catch { setRides(readLocalList('hravo_ride_bookings')); }

    try { const ca = await sup.from('capital_accounts').select('*').order('created_at', { ascending: false }); if (ca.data) { setCapitalList(ca.data); writeLocalList('hravo_capital', ca.data); } else setCapitalList(readLocalList('hravo_capital')); } catch { setCapitalList(readLocalList('hravo_capital')); }
    try { const lo = await sup.from('loans').select('*').order('created_at', { ascending: false }); if (lo.data) { setLoansList(lo.data); writeLocalList('hravo_loans', lo.data); } else setLoansList(readLocalList('hravo_loans')); } catch { setLoansList(readLocalList('hravo_loans')); }
    try { const lp = await sup.from('loan_payments').select('*').order('created_at', { ascending: false }); if (lp.data) setLoanPayments(lp.data); else setLoanPayments(readLocalList('hravo_loan_payments')); } catch { setLoanPayments(readLocalList('hravo_loan_payments')); }
    try { const vp = await sup.from('vendor_payables').select('*').order('created_at', { ascending: false }); if (vp.data) { setVendorPayables(vp.data); writeLocalList('hravo_vendor_payables', vp.data); } else setVendorPayables(readLocalList('hravo_vendor_payables')); } catch { setVendorPayables(readLocalList('hravo_vendor_payables')); }
    try { const ex = await sup.from('expenses').select('*').order('created_at', { ascending: false }); if (ex.data) { setExpensesList(ex.data); writeLocalList('hravo_expenses', ex.data); } else setExpensesList(readLocalList('hravo_expenses')); } catch { setExpensesList(readLocalList('hravo_expenses')); }
    try { const as = await sup.from('assets').select('*').order('created_at', { ascending: false }); if (as.data) { setAssetsList(as.data); writeLocalList('hravo_assets', as.data); } else setAssetsList(readLocalList('hravo_assets')); } catch { setAssetsList(readLocalList('hravo_assets')); }
    try { const bl = await sup.from('bills').select('*').order('created_at', { ascending: false }); if (bl.data) { setBillsList(bl.data); writeLocalList('hravo_bills', bl.data); } else setBillsList(readLocalList('hravo_bills')); } catch { setBillsList(readLocalList('hravo_bills')); }
    try { const binfo = localStorage.getItem('hravo_business_info_obj'); if(binfo) setBusinessInfo(JSON.parse(binfo)); } catch {}

    try {
      const fj = await sup.from('finance_journal').select('*').order('created_at', { ascending: false });
      if (fj.data) { setFinanceJournal(fj.data); writeLocalList('hravo_finance_journal', fj.data); } else { setFinanceJournal(readLocalList('hravo_finance_journal')); }
    } catch { setFinanceJournal(readLocalList('hravo_finance_journal')); }

    try {
      const ch = await sup.from('cash_ledger').select('*').order('created_at', { ascending: false });
      if (ch.data) {
        setCashList(ch.data);
        writeLocalList('hravo_cash_ledger', ch.data);
      } else {
        setCashList(readLocalList('hravo_cash_ledger'));
      }
    } catch {
      setCashList(readLocalList('hravo_cash_ledger'));
    }

    try {
      const d = await sup.from('staff_profiles').select('id, staff_name, phone, role, salary, address, created_at').order('created_at', { ascending: false });
      if (d.data) {
        setStaff(d.data);
        writeLocalList('hravo_staff_profiles', d.data);
      } else {
        setStaff(readLocalList('hravo_staff_profiles'));
      }
    } catch {
      const localStaff = readLocalList('hravo_staff_profiles');
      setStaff(localStaff);
    }

    try {
      const e = await sup.from('customer_profiles').select('*').order('created_at', { ascending: false });
      if (e.data && e.data.length > 0) {
        setCust(e.data);
        writeLocalList('hravo_customer_profiles', e.data);
      } else if (e.data && e.data.length === 0) {
        const local = readLocalList('hravo_customer_profiles');
        setCust(local.length > 0 ? local : []);
      } else {
        setCust(readLocalList('hravo_customer_profiles'));
      }
    } catch {
      setCust(readLocalList('hravo_customer_profiles'));
    }

    try {
      const f = await sup.from('service_bookings').select('*').order('created_at', { ascending: false });
      if (f.data) setService(f.data); else setService(readLocalList('hravo_service_bookings'));
    } catch {
      setService(readLocalList('hravo_service_bookings'));
    }

    try {
      const g = await sup.from('insurance').select('*').order('created_at', { ascending: false });
      if (g.data) setInsure(g.data); else setInsure(readLocalList('hravo_insurance'));
    } catch {
      setInsure(readLocalList('hravo_insurance'));
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(()=>{}).finally(()=> html5QrCodeRef.current?.clear());
      }
    }
  }, []);

  // INIT OCR WORKER
  useEffect(() => {
    const initWorker = async () => {
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng', 1, {
          logger: (m: any) => { if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100)); }
        });
        await worker.setParameters({
          tessedit_pageseg_mode: 6 as any,
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-₹. '
        });
        ocrWorkerRef.current = worker;
        setOcrReady(true);
        setScanStatus('OCR Ready Fast');
      } catch {}
    };
    initWorker();
    return () => {
      if (ocrWorkerRef.current) { ocrWorkerRef.current.terminate(); }
    };
  }, []);

  const handleLogin = async () => {
    const res = await verifyAdminPassword(passwordInput);
    if (res === 'ok') {
      setIsAuthenticated(true);
      localStorage.setItem('honda_admin_auth', 'true');
      setPasswordInput('');
    } else if (res === 'unconfigured') {
      alert('Admin auth hi he deploy ah setup loh a ni. Vercel env ah NEXT_PUBLIC_ADMIN_PASSWORD dah rawh (+ Redeploy) emaw Supabase ah supabase/security-hardening.sql run rawh.');
    } else alert('Password dik lo!');
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('honda_admin_auth');
    setSettingsUnlocked(false);
    stopCam();
  };

  const parseHondaQR = (val: string) => {
    const clean = val.replace(/\n/g, ' ').replace(/\s+/g, ' ').toUpperCase();
    const garbage = ['AL', 'ETC', 'LL', 'TT'];
    let filtered = clean;
    garbage.forEach(g => { filtered = filtered.replace(new RegExp(`\\b${g}\\b`, 'g'), '') });
    // Improved part number extraction
    let codeMatch = filtered.match(/(\d{5}[A-Z0-9\-]{4,})/) 
      || filtered.match(/(\d{5}[A-Z]{2,5}\d*[A-Z0-9-]*)/)
      || filtered.match(/(9\d{4}[A-Z0-9\-]+)/)
      || filtered.match(/(\d{5,12})/);
    const mrpMatch = filtered.match(/₹\s*([\d,]+\.?\d*)/) || filtered.match(/MRP[^0-9]*([\d,]+\.?\d*)/i) || filtered.match(/(\d{3,5}\.00)/);
    const qtyMatch = filtered.match(/QUANTITY:\s*(\d+)/i) || filtered.match(/QTY\s*(\d+)/i);
    let name = '';
    if (filtered.includes('REGULATOR')) name = 'REGULATOR RECTIFIER COMPLETE';
    else if (filtered.includes('SEAL OIL')) name = 'SEAL OIL';
    else if (filtered.includes('AIR FILTER')) name = 'AIR FILTER';
    else if (filtered.includes('BRAKE SHOE')) name = 'BRAKE SHOE';
    else if (filtered.includes('SPARK PLUG')) name = 'SPARK PLUG';
    else {
      const m = filtered.match(/(?:\d{5}[A-Z0-9-]+)\s+([A-Z ]{5,40}?)(?:\s+MFD|\s+MFG|\s+MRP|\s+NET)/);
      if (m) name = m[1].trim();
    }
    if (name.length < 4) name = 'GENUINE PART';
    return {
      name: name || (codeMatch? codeMatch[1] : clean.slice(0, 25)),
      price: mrpMatch? mrpMatch[1].replace(/,/g,'') : '',
      qty: qtyMatch? qtyMatch[1] : '1',
      code: codeMatch?.[1]?.replace(/\s/g,'') || clean.slice(0, 16)
    };
  };

  const applyParsedPart = (raw: string) => {
    const parsed = parseHondaQR(raw);
    setQr(raw);
    setPendingPart((prev:any) => ({
      code: parsed.code || prev?.code || raw.slice(0,16),
      name: parsed.name && parsed.name.length > 3? parsed.name : (prev?.name || parsed.name),
      price: parsed.price || prev?.price || '150',
      qty: parsed.qty
    }));
    if(parsed.name && parsed.name!== 'GENUINE PART') setPName(parsed.name);
    if(parsed.price) setPPrice(parsed.price);
    setPQty(parsed.qty);
    setShowPartConfirm(true);
    setScanStatus(`Part: ${parsed.code} - ${parsed.name} - ₹${parsed.price}`);
  };

  // Modified preprocessing: full image, no crop, improved threshold
  const preprocessCanvas = (sourceCanvas: HTMLCanvasElement) => {
    const out = document.createElement('canvas');
    const maxDimension = 1200;
    let scale = 1;
    if (sourceCanvas.width > maxDimension || sourceCanvas.height > maxDimension) {
      scale = maxDimension / Math.max(sourceCanvas.width, sourceCanvas.height);
    }
    out.width = sourceCanvas.width * scale;
    out.height = sourceCanvas.height * scale;
    const ctx = out.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(sourceCanvas, 0, 0, out.width, out.height);
    const imageData = ctx.getImageData(0, 0, out.width, out.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const blue = data[i+2];
      const avg = (data[i] + data[i+1] + data[i+2]) / 3;
      const v = (blue > 100 && avg > 70)? 255 : 0;
      data[i] = data[i+1] = data[i+2] = v;
    }
    ctx.putImageData(imageData, 0, 0);
    return out;
  };

  const runOcrOnImage = async (imageSource: any) => {
    if (!ocrReady || !ocrWorkerRef.current) {
      setScanStatus('OCR initialising, wait...');
      return;
    }
    setOcrLoading(true); setOcrProgress(0);
    let baseCanvas: HTMLCanvasElement;
    try {
      if (imageSource instanceof HTMLCanvasElement) { baseCanvas = imageSource; }
      else if (imageSource instanceof File) {
        const img = new Image();
        const url = URL.createObjectURL(imageSource);
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
        baseCanvas = document.createElement('canvas');
        const maxW = 900;
        const sc = Math.min(1, maxW / img.width);
        baseCanvas.width = img.width * sc; baseCanvas.height = img.height * sc;
        baseCanvas.getContext('2d')!.drawImage(img, 0, 0, baseCanvas.width, baseCanvas.height);
        URL.revokeObjectURL(url);
      } else { baseCanvas = imageSource; }
      const processed = preprocessCanvas(baseCanvas);
      const { data: { text } } = await ocrWorkerRef.current.recognize(processed);
      const cleaned = text.toUpperCase();
      setOcrText(cleaned);
      if (cleaned.trim().length > 5) applyParsedPart(cleaned);
    } catch (e: any) { setScanStatus('OCR failed: ' + e.message); }
    finally { setOcrLoading(false); }
  };

  const captureFrameAndOcr = async () => {
    const video = document.querySelector(`#${qrRegionId} video`) as HTMLVideoElement;
    if (!video) { alert('Camera on hmasa rawh'); return; }
    const canvas = canvasRef.current!;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    await runOcrOnImage(canvas);
  };

  const handleFileOcr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; await runOcrOnImage(file);
  };
  const performManualOcr = () => { const clean = ocrText.trim(); if (!clean) return; applyParsedPart(clean); };

  const handleQrSuccess = (val: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setQr(val);
    const cleanCode = val.trim().toUpperCase().split(/[\s\n]+/)[0].replace(/[^A-Z0-9-]/g,'');
    if (mode === 'in') {
      const sup = getSupabase();
      sup.from('inventory').select('*').eq('part_no', cleanCode).maybeSingle().then(({data}) => {
        if (data) {
          setPendingPart({ code: data.part_no, name: data.name, price: String(data.price), qty: '1' });
          setPName(data.name);
          setPPrice(String(data.price));
          setPQty('1');
          setShowPartConfirm(true);
          setScanStatus(`Found in DB: ${data.name}`);
        } else {
          const parsed = parseHondaQR(val);
          setPendingPart({ code: cleanCode, name: parsed.name !== 'GENUINE PART' ? parsed.name : 'GENUINE PART', price: parsed.price || '150', qty: '1' });
          setPName(parsed.name !== 'GENUINE PART' ? parsed.name : '');
          setPPrice(parsed.price || '150');
          setPQty('1');
          setShowPartConfirm(true);
          setScanStatus(`New: ${cleanCode} - Manual add ngai`);
        }
        isProcessingRef.current = false;
        stopCam();
      });
      return;
    }
    if (mode === 'out') {
      const sup = getSupabase();
      sup.from('inventory').select('*').eq('part_no', cleanCode).maybeSingle().then(({data}) => {
        if (data) setOutId(data.id);
        isProcessingRef.current = false;
        setTab('parts');
        stopCam();
      });
      return;
    }
    if (mode === 'service') {
      const sup = getSupabase();
      sup.from('service_bookings').select('*').eq('qr_code', cleanCode).maybeSingle().then(({data}) => {
        if (data) {
          setCompletingService(data);
          setCompletePrice(String(data.amount || 500));
          setScanStatus(`Service: ${data.customer_name}`);
        } else {
          alert('Service hmuh loh - QR: ' + cleanCode);
        }
        isProcessingRef.current = false;
        stopCam();
      });
      return;
    }
    isProcessingRef.current = false;
    stopCam();
  };

  const startCam = async (m: string) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    isProcessingRef.current = false;
    setMode(m);
    setScanning(true);
    setScanStatus('Camera opening...');
    if (html5QrCodeRef.current) {
      try { await html5QrCodeRef.current.stop(); } catch {}
      try { await html5QrCodeRef.current.clear(); } catch {}
      html5QrCodeRef.current = null;
    }
    setTimeout(async () => {
      try {
        const qrBoxSize = Math.min(window.innerWidth - 60, 250);
        const html5QrCode = new Html5Qrcode(qrRegionId);
        html5QrCodeRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: qrBoxSize, height: qrBoxSize }, aspectRatio: 1.0 },
          (decodedText) => handleQrSuccess(decodedText),
          () => {}
        );
        setScanStatus(ocrReady ? 'Camera live - OCR Fast Ready' : 'Camera live');
      } catch (err: any) {
        alert('Camera allow rawh - HTTPS ngai a nia. Error: ' + (err?.message || err));
        setScanning(false);
      }
      isStartingRef.current = false;
    }, 300);
  };

  const stopCam = async () => {
    setScanning(false);
    if (html5QrCodeRef.current) {
      try { if ((html5QrCodeRef.current as any).isScanning) await html5QrCodeRef.current.stop(); } catch {}
      try { await html5QrCodeRef.current.clear(); } catch {}
      html5QrCodeRef.current = null;
    }
  };

  const useQr = async () => {
    if (!qr) return;
    handleQrSuccess(qr);
  };

  const uploadImage = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: JSON.stringify({ image: reader.result }),
        });
        const data = await res.json();
        if (data.url) setVImage(data.url);
        else alert('Upload failed: ' + (data.error || 'Unknown error'));
      } catch (err: any) {
        alert('Upload error: ' + (err?.message || err));
      }
    };
  };

  const addPart = async () => {
    if (!pName) return;
    const sup = getSupabase();
    const scannedNo = pendingPart?.code || qr;
    try {
      const { data: existing } = await sup.from('inventory').select('*').eq('part_no', scannedNo).maybeSingle();
      if (existing) {
        await sup.from('inventory').update({ stock: existing.stock + Number(pQty || 1), price: Number(pPrice || existing.price), name: pName, part_no: scannedNo }).eq('id', existing.id);
      } else {
        await sup.from('inventory').insert([{ name: pName, part_no: scannedNo, category: cat, stock: Number(pQty || 1), price: Number(pPrice || 0) }]);
      }
    } catch {
      await sup.from('inventory').insert([{ name: `${scannedNo} - ${pName}`, category: cat, stock: Number(pQty || 1), price: Number(pPrice || 0) }]);
    }
    setPName(''); setShowPartConfirm(false); setPendingPart(null); setQr('');
    isProcessingRef.current = false;
    load();
  };

  const outPart = async () => {
    if (!outId) return;
    const sup = getSupabase();
    const p = inv.find((x: any) => x.id === outId);
    await sup.from('inventory').update({ stock: Math.max(0, p.stock - Number(outQty)) }).eq('id', p.id);
    await sup.from('transactions').insert([{ type: 'lut', amount: Number(p.price) * Number(outQty), reason: cat.toUpperCase() + ' ' + p.name }]);
    setOutId(''); setOutQty('1'); load();
  };

  const addVeh = async () => {
    if (!vModel) return alert('Model');
    const sup = getSupabase();
    await sup.from('vehicle_inventory').insert([{ vehicle_type: vCat, model_name: vModel, chassis_no: vChassis, engine_no: vEngine, color: vColor, stock: Number(vQty || 1), price: Number(vPrice || 0), image_url: vImage }]);
    setVModel(''); setVChassis(''); setVEngine(''); setVPrice(''); setVImage(''); load();
  };
  const addCust = async () => {
    const name = cName.trim();
    const phone = cPhone.trim();
    const model = cModel.trim();
    if (!name || !phone || !model) {
      alert('Name, Phone, Model hi fill rawh');
      return;
    }
    const sup = getSupabase();
    const due = Number(cTotal || 0) - Number(cAdv || 0);
    const payload = {
      customer_name: name,
      phone,
      address: cAddr.trim(),
      vehicle_type: vCat,
      model_name: model,
      chassis_no: cChassis.trim(),
      engine_no: cEngine.trim(),
      color: cColor.trim(),
      total_amount: Number(cTotal || 0),
      advance_amount: Number(cAdv || 0),
      due_amount: due,
      payment_mode: cPay,
    };
    try {
      const { data, error } = await sup.from('customer_profiles').insert([payload]).select();
      if (error) throw error;
      const inserted = data && data[0] ? data[0] : { ...payload, id: Date.now(), created_at: new Date().toISOString() };
      const updated = [inserted, ...readLocalList('hravo_customer_profiles')];
      writeLocalList('hravo_customer_profiles', updated);
      setCust(updated);
      setCName(''); setCPhone(''); setCModel(''); setCTotal(''); setCAdv(''); setCChassis(''); setCEngine(''); setCColor(''); setCAddr('');
    } catch (err: any) {
      const fallback = { ...payload, id: Date.now(), created_at: new Date().toISOString() };
      const updated = [fallback, ...readLocalList('hravo_customer_profiles')];
      writeLocalList('hravo_customer_profiles', updated);
      setCust(updated);
      setCName(''); setCPhone(''); setCModel(''); setCTotal(''); setCAdv(''); setCChassis(''); setCEngine(''); setCColor(''); setCAddr('');
      alert('Supabase error (saved locally): ' + (err?.message || JSON.stringify(err)));
    }
    load();
  };
  const addStaff = async () => {
    const name = sName.trim();
    const phone = sPhone.trim();
    const password = sPass.trim();
    if (!name || !phone) {
      alert('Name leh Phone hi fill rawh');
      return;
    }
    if (!password) {
      alert('Staff password siam rawh');
      return;
    }
    const sup = getSupabase();
    const payload: any = {
      staff_name: name,
      phone,
      role: sRole,
      salary: Number(sSal || 0),
      address: sAddr.trim(),
      password: password,
    };
    try {
      let { data, error } = await sup.from('staff_profiles').insert([payload]);
      if (error && error.message.includes('password')) {
        const { password: _p, ...noPassPayload } = payload;
        const retry = await sup.from('staff_profiles').insert([noPassPayload]);
        data = retry.data;
        error = retry.error;
      }
      if (error) throw error;
      const inserted = (data && data[0]) || { ...payload, id: Date.now() };
      const updated = [inserted, ...readLocalList('hravo_staff_profiles')];
      writeLocalList('hravo_staff_profiles', updated);
      setStaff(updated);
      setSName(''); setSPhone(''); setSRole('Manager'); setSSal(''); setSAddr(''); setSPass(''); load();
    } catch (err: any) {
      const fallback = [{ ...payload, id: Date.now(), created_at: new Date().toISOString() }, ...readLocalList('hravo_staff_profiles')];
      writeLocalList('hravo_staff_profiles', fallback);
      setStaff(fallback);
      setSName(''); setSPhone(''); setSRole('Manager'); setSSal(''); setSAddr(''); setSPass('');
      console.error('addStaff error:', err);
      alert(err?.message || 'Staff add a hna a loh. Local list ah a lut tawh.');
    }
  };
  const addCash = async () => {
    if (!cashR ||!cashA) return;
    const sup = getSupabase();
    const payload = { type: cashT, amount: Number(cashA), reason: cashR, payment_mode: cashM, created_by: 'admin' };
    try {
      const { data, error } = await sup.from('cash_ledger').insert([payload]).select();
      if (error) throw error;
      const inserted = data && data[0] ? data[0] : { ...payload, id: Date.now(), created_at: new Date().toISOString() };
      const updated = [inserted, ...readLocalList('hravo_cash_ledger')];
      writeLocalList('hravo_cash_ledger', updated);
      setCashList(updated);
    } catch (err:any) {
      const fallback = { ...payload, id: Date.now(), created_at: new Date().toISOString() };
      const updated = [fallback, ...readLocalList('hravo_cash_ledger')];
      writeLocalList('hravo_cash_ledger', updated);
      setCashList(updated);
      console.error('cash_ledger error', err);
    }
    try { await sup.from('transactions').insert([{ type: cashT, amount: Number(cashA), reason: cashR + ' - ' + cashM }]); } catch {}
    setCashR(''); setCashA(''); load();
  };
  const addService = async () => {
    if (!svName ||!svPhone ||!svModel) return alert('Name Phone Model');
    const sup = getSupabase();
    const qrCode = 'HRAVO-SVC-' + Date.now().toString().slice(-6) + '-' + svPhone.slice(-4);
    const { error } = await sup.from('service_bookings').insert([{ customer_name: svName, phone: svPhone, model_name: svModel, chassis_no: svChassis, service_type: svType, service_date: svDate || new Date().toISOString().split('T')[0], amount: Number(svAmt || 500), status: 'pending', qr_code: qrCode }]);
    if (error) { alert(error.message); return; }
    setSvName(''); setSvPhone(''); setSvModel(''); setSvChassis(''); load();
    const url = `${window.location.origin}/qr/?code=${encodeURIComponent(qrCode)}`;
    window.open(url, '_blank');
    alert('BOOKED - QR Tab thar hawng: ' + qrCode);
  };
  const addInsurance = async () => {
    if (!inName ||!inPhone ||!inModel ||!inEnd) return alert('Name Phone Model End');
    const sup = getSupabase();
    await sup.from('insurance').insert([{ customer_name: inName, phone: inPhone, model_name: inModel, policy_no: inPolicy, company: inCompany, start_date: inStart || new Date().toISOString().split('T')[0], end_date: inEnd, amount: Number(inAmt || 2500), status: 'active' }]);
    await sup.from('transactions').insert([{ type: 'lut', amount: Number(inAmt || 2500), reason: 'INS ' + inName }]);
    setInName(''); setInPhone(''); setInModel(''); setInPolicy(''); setInEnd(''); load();
  };
  const completeService = async (id: string) => { const s = service.find((x: any) => x.id === id); if (s) { setCompletingService(s); setCompletePrice(String(s.amount || 500)); } };
  const confirmCompleteWithPrice = async () => {
    if (!completingService) return;
    const sup = getSupabase();
    await sup.from('service_bookings').update({ status: 'completed', amount: Number(completePrice || 0) }).eq('id', completingService.id);
    await sup.from('transactions').insert([{ type: 'lut', amount: Number(completePrice || 0), reason: 'SERVICE COMPLETE ' + completingService.customer_name + ' - Rs ' + completePrice }]);
    setCompletingService(null); setCompletePrice('500'); load();
    alert('COMPLETED - Rs ' + completePrice + ' - ' + completingService.customer_name);
  };
  const requestDelete = (tb: string, id: string) => { setShowDeleteConfirm({ tb, id }); setDeletePassword(''); };
  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    const financeDeleteKeys = ['finance_journal', 'capital', 'loan', 'loan_payment', 'vendor_payable', 'expense', 'asset'];
    const isFinanceDelete = financeDeleteKeys.includes(showDeleteConfirm.tb);
    if (!isFinanceDelete && (await verifyAdminPassword(deletePassword)) !== 'ok') {
      alert('Password dik lo!');
      return;
    }

    const sup = getSupabase();
    const t = showDeleteConfirm.tb === 'inv'? 'inventory' : showDeleteConfirm.tb === 'veh'? 'vehicle_inventory' : showDeleteConfirm.tb === 'staff'? 'staff_profiles' : showDeleteConfirm.tb === 'cust'? 'customer_profiles' : showDeleteConfirm.tb === 'service'? 'service_bookings' : showDeleteConfirm.tb === 'ins'? 'insurance' : showDeleteConfirm.tb === 'cash_ledger' ? 'cash_ledger' : showDeleteConfirm.tb === 'finance_journal' ? 'finance_journal' : showDeleteConfirm.tb === 'capital' ? 'capital_accounts' : showDeleteConfirm.tb === 'loan' ? 'loans' : showDeleteConfirm.tb === 'loan_payment' ? 'loan_payments' : showDeleteConfirm.tb === 'vendor_payable' ? 'vendor_payables' : showDeleteConfirm.tb === 'expense' ? 'expenses' : showDeleteConfirm.tb === 'asset' ? 'assets' : showDeleteConfirm.tb === 'ride' ? 'ride_bookings' : 'transactions';
    try {
      await sup.from(t).delete().eq('id', showDeleteConfirm.id);
      const localKeyMap: any = {
        inventory: 'hravo_inventory',
        vehicle_inventory: 'hravo_vehicle_inventory',
        staff_profiles: 'hravo_staff_profiles',
        customer_profiles: 'hravo_customer_profiles',
        service_bookings: 'hravo_service_bookings',
        ride_bookings: 'hravo_ride_bookings',
        insurance: 'hravo_insurance',
        cash_ledger: 'hravo_cash_ledger',
        transactions: 'hravo_transactions',
        finance_journal: 'hravo_finance_journal',
        capital_accounts: 'hravo_capital',
        loans: 'hravo_loans',
        loan_payments: 'hravo_loan_payments',
        vendor_payables: 'hravo_vendor_payables',
        expenses: 'hravo_expenses',
        assets: 'hravo_assets',
      };
      const localKey = localKeyMap[t] || `hravo_${t}`;
      const local = readLocalList(localKey);
      writeLocalList(localKey, local.filter((x:any)=> x.id !== showDeleteConfirm.id));
    } catch {}
    setShowDeleteConfirm(null); setDeletePassword(''); load();
  };

  const unlockSettings = async () => {
    if ((await verifyAdminPassword(settingsPass)) === 'ok') {
      setSettingsUnlocked(true);
      setSettingsPass('');
    } else {
      alert('Admin password dik lo!');
    }
  };
  const resetAllDues = async () => {
    if (!settingsUnlocked) { alert('Unlock Settings first'); return; }
    if (!confirm('Reset ALL customers due to 0?')) return;
    const sup = getSupabase();
    try { await sup.from('customer_profiles').update({ due_amount: 0 }).neq('id', '00000000-0000-0000-0000-000000000000'); } catch {}
    const local = readLocalList('hravo_customer_profiles');
    writeLocalList('hravo_customer_profiles', local.map((c:any)=>({...c, due_amount:0})));
    setCust((prev:any)=>prev.map((c:any)=>({...c, due_amount:0})));
    load();
    alert('All dues reset to 0');
  };
  const resetSingleDue = async () => {
    if (!settingsUnlocked) { alert('Unlock first'); return; }
    if (!dueResetPhone) { alert('Enter phone or name'); return; }
    const phone = dueResetPhone.trim().toLowerCase();
    const matched = cust.filter((c:any)=> (c.phone && c.phone.toLowerCase().includes(phone)) || (c.customer_name && c.customer_name.toLowerCase().includes(phone)) || (c.name && c.name.toLowerCase().includes(phone)));
    if (matched.length===0) { alert('No customer found'); return; }
    const newDue = Number(dueResetAmount||0);
    if (!confirm(`Reset ${matched.length} customer(s) to Rs ${newDue}?`)) return;
    const sup = getSupabase();
    try { for (const m of matched) { await sup.from('customer_profiles').update({ due_amount: newDue }).eq('id', m.id); } } catch {}
    const local = readLocalList('hravo_customer_profiles');
    writeLocalList('hravo_customer_profiles', local.map((c:any)=> matched.find((m:any)=>m.id===c.id) ? {...c, due_amount:newDue} : c));
    setCust((prev:any)=>prev.map((c:any)=> matched.find((m:any)=>m.id===c.id) ? {...c, due_amount:newDue} : c));
    load();
    alert(`Updated ${matched.length} to Rs ${newDue}`);
  };
  const lockSettings = () => {
    setSettingsUnlocked(false);
    setSettingsPass('');
  };
  const requestDeleteAll = (tableKey: string) => {
    if (!settingsUnlocked) {
      alert('Settings unlock phawt rawh');
      return;
    }
    setShowDeleteAllConfirm(tableKey);
  };
  const confirmDeleteAll = async () => {
    if (!showDeleteAllConfirm) return;
    if (!settingsUnlocked) return;
    const sup = getSupabase();
    const tableMap: any = {
      inv: 'inventory',
      veh: 'vehicle_inventory',
      trans: 'transactions',
      staff: 'staff_profiles',
      cust: 'customer_profiles',
      service: 'service_bookings',
      ins: 'insurance',
      parts_inv: 'parts_inventory',
      cash_ledger: 'cash_ledger',
    };
    const realTable = tableMap[showDeleteAllConfirm] || showDeleteAllConfirm;
    if (!window.confirm('⚠️ DELETE ALL rows from "' + realTable + '" ???\n\nThis CANNOT be undone. Make sure you have a backup first.')) return;
    const localKeyMap: any = {
      inv: 'hravo_inventory',
      veh: 'hravo_vehicle_inventory',
      trans: 'hravo_transactions',
      staff: 'hravo_staff_profiles',
      cust: 'hravo_customer_profiles',
      service: 'hravo_service_bookings',
      ins: 'hravo_insurance',
      parts_inv: 'hravo_parts_inventory',
      cash_ledger: 'hravo_cash_ledger',
    };
    try {
      const { error } = await sup.from(realTable).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      if (localKeyMap[showDeleteAllConfirm]) {
        writeLocalList(localKeyMap[showDeleteAllConfirm], []);
      }
      alert(`${realTable} - ALL DELETED`);
      setShowDeleteAllConfirm(null);
      load();
    } catch (err: any) {
      if (localKeyMap[showDeleteAllConfirm]) {
        writeLocalList(localKeyMap[showDeleteAllConfirm], []);
      }
      alert('Deleted locally (table maybe not exist on Supabase): ' + (err?.message || ''));
      setShowDeleteAllConfirm(null);
      load();
    }
  };

  const bal = list.filter((t: any) => t.type === 'lut').reduce((a: any, b: any) => a + Number(b.amount), 0) - list.filter((t: any) => t.type === 'chhuak').reduce((a: any, b: any) => a + Number(b.amount), 0);
  const due = cust.reduce((a: any, b: any) => a + Number(b.due_amount || 0), 0);
  const navItems = [
    { id: 'dash', label: 'Overview', icon: '◉', adminOnly: false },
    { id: 'scan', label: 'Scan', icon: '◌', adminOnly: false },
    { id: 'forms', label: 'FORMS', icon: '✎', adminOnly: false },
    { id: 'records', label: 'RECORDS', icon: '☰', adminOnly: false },
    { id: 'rides', label: 'RIDES (Test Drive)', icon: '🚗', adminOnly: false },
    { id: 'cash', label: 'Cash', icon: '◫', adminOnly: false },
    { id: 'bills', label: 'BILLS / PRINT', icon: '⎙', adminOnly: false },
    { id: 'finance', label: 'Finance (Admin)', icon: '◈', adminOnly: true },
    { id: 'settings', label: 'Settings (Admin)', icon: '⚙', adminOnly: true },
  ];
  const visibleNav = navItems.filter((item:any) => !item.adminOnly || settingsUnlocked);
  const formTabs = [
    {id:'parts_in', label:'Parts IN'},
    {id:'parts_out', label:'Parts OUT'},
    {id:'vehicle', label:'Vehicle'},
    {id:'customer', label:'Customer'},
    {id:'staff', label:'Staff'},
    {id:'service', label:'Service'},
    {id:'insurance', label:'Insurance'},
    {id:'cash', label:'Cash Entry'},
  ];
  const recordTabs = [
    {id:'parts', label:'Parts Stock'},
    {id:'vehicles', label:'Vehicles'},
    {id:'customers', label:'Customers'},
    {id:'staff', label:'Staff List'},
    {id:'service', label:'Service'},
    {id:'insurance', label:'Insurance'},
    {id:'cash_ledger', label:'Cash Ledger'},
    {id:'transactions', label:'Transactions'},
    {id:'finance_journal', label:'Finance Journal'},
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05070b] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="bg-[#ff0040] inline-block px-4 py-2 rounded-xl font-black text-sm tracking-[0.3em]">HRAVO</div>
            <h1 className="font-black text-2xl mt-3 tracking-[0.3em]">ADMIN</h1>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-6 shadow-[0_0_35px_rgba(239,68,68,0.08)] backdrop-blur-xl">
            <input value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} type="password" placeholder="Password" className="w-full bg-black/50 border border-white/20 p-4 rounded-xl text-sm outline-none focus:border-red-500" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full mt-3 bg-white text-black py-4 rounded-xl font-black text-sm">LOGIN</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_22%)]" />

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#1a1a1a] border border-red-500/30 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-black text-red-400 mb-2">DELETE ENTRY?</h3>
            <p className="text-xs opacity-50 mb-3">Table: {showDeleteConfirm.tb} - ID: {String(showDeleteConfirm.id).slice(0,8)}...</p>
            {!['finance_journal', 'capital', 'loan', 'loan_payment', 'vendor_payable', 'expense', 'asset'].includes(showDeleteConfirm.tb) && (
              <input value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} type="password" placeholder="Admin Password" className="w-full bg-black/50 border border-red-500/30 p-3 rounded-xl text-sm mb-3 outline-none" />
            )}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="bg-white/10 py-3 rounded-xl font-black text-xs">CANCEL</button>
              <button onClick={confirmDelete} className="bg-red-600 text-white py-3 rounded-xl font-black text-xs">DELETE</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#1a1a1a] border border-red-500/50 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-black text-red-500 mb-2 text-lg">DELETE ALL {String(showDeleteAllConfirm).toUpperCase()}?</h3>
            <p className="text-xs opacity-70 mb-4">He thil zawng zawng a bo vek ang! Are you sure? This cannot be undone.</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowDeleteAllConfirm(null)} className="bg-white/10 py-3 rounded-xl font-black text-xs">CANCEL</button>
              <button onClick={confirmDeleteAll} className="bg-red-600 text-white py-3 rounded-xl font-black text-xs">YES DELETE ALL</button>
            </div>
          </div>
        </div>
      )}

      {completingService && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#1a1a1a] border border-yellow-500/30 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-black text-yellow-400 mb-2">SERVICE COMPLETE - PRICE ENTRY</h3>
            <p className="text-xs opacity-60 mb-1">{completingService.customer_name} - {completingService.model_name}</p>
            <p className="font-mono opacity-40 mb-3">{completingService.qr_code} | {completingService.service_type}</p>
            <input value={completePrice} onChange={(e) => setCompletePrice(e.target.value)} type="number" placeholder="Price Rs" className="w-full bg-black border border-yellow-500/30 p-4 rounded-xl text-sm mb-3 outline-none" autoFocus />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setCompletingService(null)} className="bg-white/10 py-3 rounded-xl font-black text-xs">CANCEL</button>
              <button onClick={confirmCompleteWithPrice} className="bg-green-500 text-black py-3 rounded-xl font-black text-xs">DONE Rs {completePrice}</button>
            </div>
          </div>
        </div>
      )}
      {showPartConfirm && pendingPart && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#1a1a1a] border border-green-500/30 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-black text-green-400 mb-1">PARTS IN - CONFIRM</h3>
            <p className="font-mono opacity-40 mb-3">Scanned: {pendingPart.code}</p>
            <div className="space-y-2 mb-3">
              <div><p className="opacity-50">PART NO</p><p className="font-mono font-black text-xs bg-black p-2 rounded border border-white/10">{pendingPart.code}</p></div>
              <div><p className="opacity-50">NAME</p><input value={pName} onChange={(e)=>setPName(e.target.value)} className="w-full bg-black border border-white/20 p-3 rounded-xl text-sm" /></div>
              <div className="grid grid-cols-2 gap-2"><div><p className="opacity-50">PRICE (MRP)</p><input value={pPrice} onChange={(e)=>setPPrice(e.target.value)} type="number" className="w-full bg-black border border-white/20 p-3 rounded-xl text-sm" /></div><div><p className="opacity-50">QTY</p><input value={pQty} onChange={(e)=>setPQty(e.target.value)} type="number" className="w-full bg-black border border-white/20 p-3 rounded-xl text-sm" /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={()=>{setShowPartConfirm(false); setPendingPart(null);}} className="bg-white/10 py-3 rounded-xl font-black text-xs">CANCEL</button>
              <button onClick={addPart} className="bg-green-500 text-black py-3 rounded-xl font-black text-xs">CONFIRM + ADD</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/80 p-5 lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-lg font-black">H</div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-red-400">HRAVO</p>
              <h1 className="mt-1 text-lg font-black tracking-[0.2em]">ADMIN</h1>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {visibleNav.map((item: any) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${
                  tab === item.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'settings' && !settingsUnlocked && <span className="ml-auto text-[10px] bg-red-600 text-white px-2 py-1 rounded-full">LOCKED</span>}
                {item.id === 'settings' && settingsUnlocked && <span className="ml-auto text-[10px] bg-green-500 text-black px-2 py-1 rounded-full">UNLOCKED</span>}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            {!settingsUnlocked && (
              <div className="rounded-[1.2rem] border border-orange-500/30 bg-orange-500/10 p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-orange-300">Admin Unlock</p>
                <div className="mt-2 flex gap-1">
                  <input value={settingsPass} onChange={(e)=>setSettingsPass(e.target.value)} type="password" placeholder="Password" className="flex-1 bg-black/50 border border-white/10 p-2 rounded-lg text-[10px] outline-none" onKeyDown={(e)=> e.key === 'Enter' && unlockSettings()} />
                  <button onClick={unlockSettings} className="bg-orange-500 text-black px-3 rounded-lg font-black text-[10px]">UNLOCK</button>
                </div>
                <p className="text-[8px] opacity-40 mt-1">Unlocks Finance and Settings (Admin Only)</p>
              </div>
            )}
            {settingsUnlocked && (
              <div className="rounded-[1.2rem] border border-green-500/30 bg-green-500/10 p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-green-400">Admin Mode Active</p>
                <div className="flex justify-between items-center mt-1"><span className="text-[10px] opacity-60">Finance and Settings visible</span><button onClick={lockSettings} className="bg-white/10 px-2 py-1 rounded-full text-[9px] font-black">LOCK</button></div>
              </div>
            )}
            <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-300">Cashflow</p>
              <p className="mt-3 text-2xl font-black">₹{bal.toLocaleString()}</p>
              <p className="mt-2 text-xs text-slate-300">Due: ₹{due.toLocaleString()}</p>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-sm font-black lg:hidden">H</div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.34em] text-red-400">Dashboard</p>
                  <h2 className="mt-1 text-xl font-black tracking-[0.12em]">HRAVO</h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!settingsUnlocked && <button onClick={()=>{ const p=prompt('Admin Password:'); if(p){ setSettingsPass(p); if(p===ADMIN_PASSWORD){ setSettingsUnlocked(true); alert('Admin Unlocked - Finance and Settings now visible'); } else alert('Wrong password'); } }} className="rounded-full bg-orange-500 text-black px-3 py-2 text-[10px] font-black">ADMIN UNLOCK</button>}
                {settingsUnlocked && <span className="hidden md:block text-[10px] bg-green-500 text-black px-3 py-1 rounded-full font-black">ADMIN MODE</span>}
                <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold md:block">₹{bal.toLocaleString()}</div>
                <button onClick={handleLogout} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/10">Logout</button>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6">
            
            {tab === 'dash' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-white/5 p-4"><p className="text-[10px] opacity-50">Parts</p><p className="text-xl font-black">{inv.length}</p></div>
                  <div className="rounded-2xl bg-white/5 p-4"><p className="text-[10px] opacity-50">Vehicles</p><p className="text-xl font-black">{veh.length}</p></div>
                  <div className="rounded-2xl bg-white/5 p-4"><p className="text-[10px] opacity-50">Customers</p><p className="text-xl font-black">{cust.length}</p></div>
                  <div className="rounded-2xl bg-white/5 p-4"><p className="text-[10px] opacity-50">Balance</p><p className="text-xl font-black">Rs {[...list.filter((t:any)=>t.type==='lut'), ...cashList.filter((t:any)=>t.type==='lut')].reduce((a:any,b:any)=>a+Number(b.amount||0),0) - [...list.filter((t:any)=>t.type==='chhuak'), ...cashList.filter((t:any)=>t.type==='chhuak')].reduce((a:any,b:any)=>a+Number(b.amount||0),0)}</p></div>
                </div>
              </div>
            )}

            {tab === 'scan' && (
              <div className="space-y-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                  <p className="font-black text-xs mb-3">SCAN QR + OCR (Honda Label)</p>
                  <div id={qrRegionId} className="rounded-xl overflow-hidden bg-black/50 min-h-[200px]"></div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={()=>startCam('in')} className="flex-1 bg-white text-black py-2 rounded-xl font-black text-xs">SCAN IN</button>
                    <button onClick={()=>startCam('out')} className="flex-1 bg-red-500 text-black py-2 rounded-xl font-black text-xs">SCAN OUT</button>
                    <button onClick={()=>startCam('service')} className="flex-1 bg-yellow-500 text-black py-2 rounded-xl font-black text-xs">SCAN SERVICE</button>
                    <button onClick={stopCam} className="flex-1 bg-white/10 py-2 rounded-xl font-black text-xs">STOP</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button onClick={captureFrameAndOcr} disabled={!scanning || ocrLoading || !ocrReady} className="bg-yellow-500 disabled:opacity-30 text-black py-3 font-black text-xs rounded-xl">{ocrLoading? `${ocrProgress}% OCR...` : '📸 CAPTURE + OCR'}</button>
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white/10 py-3 rounded-xl font-black text-xs">📁 UPLOAD PHOTO</button>
                    <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileOcr} className="hidden" />
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <input value={qr} onChange={(e)=>setQr(e.target.value)} placeholder="Or enter code manually" className="flex-1 bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <button onClick={useQr} className="bg-white text-black px-5 rounded-xl font-black text-xs">USE</button>
                    </div>
                    <textarea value={ocrText} onChange={(e) => setOcrText(e.target.value)} placeholder="OCR text hetah a lo lang ang..." className="w-full h-20 bg-black border border-white/10 p-3 rounded-xl text-xs font-mono" />
                    <div className="flex gap-2">
                      <button onClick={performManualOcr} disabled={!ocrReady} className="flex-1 bg-emerald-500 text-black py-3 rounded-xl font-black text-xs">PARSE OCR TEXT</button>
                    </div>
                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-cyan-300">Status: {scanStatus}</div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'rides' && (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                <p className="font-black text-xs mb-2">RIDE BOOKINGS / TEST DRIVE ({rides.length})</p>
                {rides.length === 0 && <p className="text-xs opacity-40 py-4 text-center">Ride booking a awm lo - Customer/website aṭangin booking an input hmain hei hi a lo awm ang.</p>}
                <div className="divide-y divide-white/5 max-h-[70vh] overflow-auto">
                  {rides.map((r: any) => (
                    <div key={r.id} className="py-2 flex justify-between text-xs">
                      <div>
                        <p className="font-bold">{r.customer_name || r.name} - {r.model_name || r.model} | {r.ride_date || r.date} {r.ride_time || ''}</p>
                        <p className="opacity-40 text-[10px]">{r.customer_phone || r.phone} | Status: {r.status || 'pending'}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={async () => {
                          await getSupabase().from('ride_bookings').update({ status: 'confirmed' }).eq('id', r.id);
                          load();
                        }} className="bg-green-600/20 text-green-400 px-2 rounded-full">CONFIRM</button>
                        <button onClick={() => requestDelete('ride', r.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full">DEL</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'forms' && (
              <div className="space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {formTabs.map((ft:any)=>(
                    <button key={ft.id} onClick={()=>setFormSub(ft.id)} className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap ${formSub===ft.id? 'bg-white text-black':'bg-white/10'}`}>{ft.label}</button>
                  ))}
                </div>

                {formSub==='parts_in' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                    <p className="font-black text-xs mb-3">ADD PARTS STOCK</p>
                    <div className="grid grid-cols-2 gap-2"><select value={cat} onChange={(e)=>setCat(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option value="bike">Bike</option><option value="scooty">Scooty</option><option value="parts">Parts</option></select><input value={pName} onChange={(e)=>setPName(e.target.value)} placeholder="Part Name" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <div className="grid grid-cols-2 gap-2 mt-2"><input value={pPrice} onChange={(e)=>setPPrice(e.target.value)} type="number" placeholder="Price" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={pQty} onChange={(e)=>setPQty(e.target.value)} type="number" placeholder="Qty" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <button onClick={addPart} className="w-full mt-3 bg-white text-black py-3 rounded-xl font-black text-xs">ADD PART</button>
                  </div>
                )}

                {formSub==='parts_out' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                    <p className="font-black text-xs mb-3">REMOVE PARTS (Sale)</p>
                    <div className="grid grid-cols-2 gap-2"><input value={outId} onChange={(e)=>setOutId(e.target.value)} placeholder="Part ID / Name" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={outQty} onChange={(e)=>setOutQty(e.target.value)} type="number" placeholder="Qty" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <button onClick={outPart} className="w-full mt-3 bg-red-600 text-white py-3 rounded-xl font-black text-xs">REMOVE</button>
                  </div>
                )}

                {formSub==='vehicle' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                    <p className="font-black text-xs mb-3">ADD VEHICLE</p>
                    <div className="grid grid-cols-2 gap-2"><select value={vCat} onChange={(e)=>setVCat(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option value="bike">Bike</option><option value="scooty">Scooty</option></select><input value={vModel} onChange={(e)=>setVModel(e.target.value)} placeholder="Model" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <div className="grid grid-cols-2 gap-2 mt-2"><input value={vChassis} onChange={(e)=>setVChassis(e.target.value)} placeholder="Chassis" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={vEngine} onChange={(e)=>setVEngine(e.target.value)} placeholder="Engine" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <div className="grid grid-cols-3 gap-2 mt-2"><input value={vColor} onChange={(e)=>setVColor(e.target.value)} placeholder="Color" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={vPrice} onChange={(e)=>setVPrice(e.target.value)} type="number" placeholder="Price" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={vQty} onChange={(e)=>setVQty(e.target.value)} type="number" placeholder="Qty" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input type="file" accept="image/*" onChange={uploadImage} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {vImage && <img src={vImage} alt="Vehicle preview" className="h-12 w-12 rounded-full object-cover" />}
                    </div>
                    <button onClick={addVeh} className="w-full mt-3 bg-white text-black py-3 rounded-xl font-black text-xs">ADD VEHICLE</button>
                  </div>
                )}

                {formSub==='customer' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                    <p className="font-black text-xs mb-3">ADD CUSTOMER - Auto records finance</p>
                    <div className="grid grid-cols-2 gap-2"><input value={cName} onChange={(e)=>setCName(e.target.value)} placeholder="Name" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={cPhone} onChange={(e)=>setCPhone(e.target.value)} placeholder="Phone" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <input value={cAddr} onChange={(e)=>setCAddr(e.target.value)} placeholder="Address" className="w-full mt-2 bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                    <div className="grid grid-cols-2 gap-2 mt-2"><input value={cModel} onChange={(e)=>setCModel(e.target.value)} placeholder="Model" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={cChassis} onChange={(e)=>setCChassis(e.target.value)} placeholder="Chassis" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <div className="grid grid-cols-2 gap-2 mt-2"><input value={cEngine} onChange={(e)=>setCEngine(e.target.value)} placeholder="Engine" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={cColor} onChange={(e)=>setCColor(e.target.value)} placeholder="Color" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <div className="grid grid-cols-3 gap-2 mt-2"><input value={cTotal} onChange={(e)=>setCTotal(e.target.value)} type="number" placeholder="Total" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={cAdv} onChange={(e)=>setCAdv(e.target.value)} type="number" placeholder="Advance" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><select value={cPay} onChange={(e)=>setCPay(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>Cash</option><option>UPI</option><option>Finance</option></select></div>
                    <button onClick={addCust} className="w-full mt-3 bg-white text-black py-3 rounded-xl font-black text-xs">ADD CUSTOMER</button>
                  </div>
                )}

                {formSub==='staff' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                    <p className="font-black text-xs mb-3">ADD STAFF + PASSWORD</p>
                    <div className="grid grid-cols-2 gap-2"><input value={sName} onChange={(e)=>setSName(e.target.value)} placeholder="Name" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={sPhone} onChange={(e)=>setSPhone(e.target.value)} placeholder="Phone" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <div className="grid grid-cols-2 gap-2 mt-2"><select value={sRole} onChange={(e)=>setSRole(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>Manager</option><option>Sales</option><option>Mechanic</option><option>Accountant</option></select><input value={sSal} onChange={(e)=>setSSal(e.target.value)} type="number" placeholder="Salary" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <input value={sAddr} onChange={(e)=>setSAddr(e.target.value)} placeholder="Address" className="w-full mt-2 bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                    <input value={sPass} onChange={(e)=>setSPass(e.target.value)} placeholder="Set Password for Staff Login" className="w-full mt-2 bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                    <button onClick={addStaff} className="w-full mt-3 bg-orange-500 text-black py-3 rounded-xl font-black text-xs">+ ADD STAFF WITH PASSWORD</button>
                  </div>
                )}

                {formSub==='service' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                    <p className="font-black text-xs mb-3">ADD SERVICE BOOKING</p>
                    <div className="grid grid-cols-2 gap-2"><input value={svName} onChange={(e)=>setSvName(e.target.value)} placeholder="Customer Name" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={svPhone} onChange={(e)=>setSvPhone(e.target.value)} placeholder="Phone" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <div className="grid grid-cols-2 gap-2 mt-2"><input value={svModel} onChange={(e)=>setSvModel(e.target.value)} placeholder="Model" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={svChassis} onChange={(e)=>setSvChassis(e.target.value)} placeholder="Vehicle No / Chassis" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <div className="grid grid-cols-3 gap-2 mt-2"><select value={svType} onChange={(e)=>setSvType(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>General Service</option><option>Free Service</option><option>Repair</option></select><input value={svDate} onChange={(e)=>setSvDate(e.target.value)} type="date" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={svAmt} onChange={(e)=>setSvAmt(e.target.value)} type="number" placeholder="Amount" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <button onClick={addService} className="w-full mt-3 bg-white text-black py-3 rounded-xl font-black text-xs">ADD SERVICE</button>
                  </div>
                )}

                {formSub==='insurance' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                    <p className="font-black text-xs mb-3">ADD INSURANCE</p>
                    <div className="grid grid-cols-2 gap-2"><input value={inName} onChange={(e)=>setInName(e.target.value)} placeholder="Customer Name" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={inPhone} onChange={(e)=>setInPhone(e.target.value)} placeholder="Phone" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <div className="grid grid-cols-2 gap-2 mt-2"><input value={inModel} onChange={(e)=>setInModel(e.target.value)} placeholder="Model" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={inPolicy} onChange={(e)=>setInPolicy(e.target.value)} placeholder="Policy No" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <div className="grid grid-cols-3 gap-2 mt-2"><select value={inCompany} onChange={(e)=>setInCompany(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>HDFC ERGO</option><option>ICICI Lombard</option><option>Bajaj Allianz</option></select><input value={inStart} onChange={(e)=>setInStart(e.target.value)} type="date" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><input value={inEnd} onChange={(e)=>setInEnd(e.target.value)} type="date" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /></div>
                    <input value={inAmt} onChange={(e)=>setInAmt(e.target.value)} type="number" placeholder="Premium Amount" className="w-full mt-2 bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                    <button onClick={addInsurance} className="w-full mt-3 bg-white text-black py-3 rounded-xl font-black text-xs">ADD INSURANCE</button>
                  </div>
                )}

                {formSub==='cash' && (
                  <div className="rounded-[1.5rem] border border-green-500/30 bg-white/[0.05] p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em]">CASH ENTRY (Staff + Admin)</p>
                    <div className="flex gap-2 mb-2 mt-3"><button onClick={() => setCashT('lut')} className={`flex-1 py-2 rounded-full text-xs font-black ${cashT === 'lut'? 'bg-green-500 text-black' : 'bg-white/5'}`}>LUT IN</button><button onClick={() => setCashT('chhuak')} className={`flex-1 py-2 rounded-full text-xs font-black ${cashT === 'chhuak'? 'bg-red-600 text-white' : 'bg-white/5'}`}>CHHUAK OUT</button></div>
                    <input value={cashR} onChange={(e) => setCashR(e.target.value)} placeholder="Reason" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-xs mb-2" />
                    <div className="grid grid-cols-2 gap-2"><input value={cashA} onChange={(e) => setCashA(e.target.value)} type="number" placeholder="Amount" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><select value={cashM} onChange={(e) => setCashM(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Finance</option></select></div>
                    <button onClick={addCash} className="w-full mt-3 bg-white text-black py-3 rounded-xl font-black text-xs">ADD CASH ENTRY</button>
                    <p className="text-[10px] opacity-40 mt-2">Table is in RECORDS - Cash Ledger (Admin only view)</p>
                  </div>
                )}
              </div>
            )}

            {tab === 'records' && (
              <div className="space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {recordTabs.map((rt:any)=>(
                    <button key={rt.id} onClick={()=>setRecordSub(rt.id)} className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap ${recordSub===rt.id? 'bg-white text-black':'bg-white/10'}`}>{rt.label}</button>
                  ))}
                </div>

                {recordSub==='parts' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-black text-xs mb-2">PARTS STOCK ({inv.length})</p>
                    <div className="divide-y divide-white/5 max-h-[70vh] overflow-auto">
                      {inv.map((p:any)=>(
                        <div key={p.id} className="py-2 flex justify-between text-xs"><span>{p.part_no ? p.part_no + ' - ' : ''}{p.name} - {p.category} | Qty:{p.stock || p.qty || 0} | Rs {p.price}</span><button onClick={()=>requestDelete('inv', p.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full">DEL</button></div>
                      ))}
                    </div>
                  </div>
                )}

                {recordSub==='vehicles' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-black text-xs mb-2">VEHICLES ({veh.length})</p>
                    <div className="divide-y divide-white/5 max-h-[70vh] overflow-auto">
                      {veh.map((v:any)=>(
                        <div key={v.id} className="py-2 flex justify-between text-xs"><span>{v.model_name || v.model} | {v.chassis_no} | {v.color} | Rs {v.price}</span><button onClick={()=>requestDelete('veh', v.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full">DEL</button></div>
                      ))}
                    </div>
                  </div>
                )}

                {recordSub==='customers' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-black text-xs mb-2">CUSTOMERS ({cust.length}) - Auto creates finance sale</p>
                    <div className="divide-y divide-white/5 max-h-[70vh] overflow-auto">
                      {cust.map((c:any)=>(
                        <div key={c.id} className="py-2 flex justify-between text-xs"><div><p className="font-bold">{c.customer_name || c.name} | {c.vehicle_type || c.model_name} | Rs {c.total_amount}</p><p className="opacity-40 text-[10px]">{new Date(c.created_at).toLocaleString()} | Due Rs {c.due_amount}</p></div><button onClick={()=>requestDelete('cust', c.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full h-6">DEL</button></div>
                      ))}
                    </div>
                  </div>
                )}

                {recordSub==='staff' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-black text-xs mb-2">STAFF LIST ({staff.length})</p>
                    <div className="divide-y divide-white/5 max-h-[70vh] overflow-auto">
                      {staff.map((s:any)=>(
                        <div key={s.id} className="py-2 flex justify-between text-xs items-center"><div><p className="font-bold">{s.staff_name} - {s.role} | Rs {s.salary}</p><p className="opacity-40 text-[10px]">{s.phone} | {s.address} | {new Date(s.created_at).toLocaleString()}</p></div><div className="flex gap-1"><button onClick={()=>setShowStaffPass(showStaffPass===s.id? null : s.id)} className="bg-white/10 px-2 rounded-full">PASS</button><button onClick={()=>requestDelete('staff', s.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full">DEL</button></div></div>
                      ))}
                      {showStaffPass && staff.find((s:any)=>s.id===showStaffPass) && <p className="text-green-400 text-[10px] mt-2">Password: {staff.find((s:any)=>s.id===showStaffPass).password || '(hidden - secure, run supabase/security-hardening.sql for server-side login)'}</p>}
                    </div>
                  </div>
                )}

                {recordSub==='service' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-black text-xs mb-2">SERVICE RECORDS ({service.length})</p>
                    <div className="divide-y divide-white/5 max-h-[70vh] overflow-auto">
                      {service.map((s:any)=>(
                        <div key={s.id} className="py-2 flex justify-between text-xs"><div><p className="font-bold">{s.customer_name} - {s.service_type} | Rs {s.amount}</p><p className="opacity-40 text-[10px]">{new Date(s.created_at).toLocaleString()} | Status: {s.status}</p></div><div className="flex gap-1"><button onClick={()=>completeService(s.id)} className="bg-green-600/20 text-green-400 px-2 rounded-full">COMPLETE</button><button onClick={()=>requestDelete('service', s.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full">DEL</button></div></div>
                      ))}
                    </div>
                  </div>
                )}

                {recordSub==='insurance' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-black text-xs mb-2">INSURANCE ({insure.length})</p>
                    <div className="divide-y divide-white/5 max-h-[70vh] overflow-auto">
                      {insure.map((i:any)=>(
                        <div key={i.id} className="py-2 flex justify-between text-xs"><div><p className="font-bold">{i.customer_name} | {i.policy_no} | {i.company}</p><p className="opacity-40 text-[10px]">{new Date(i.created_at).toLocaleString()} | Valid till: {i.end_date}</p></div><button onClick={()=>requestDelete('ins', i.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full">DEL</button></div>
                      ))}
                    </div>
                  </div>
                )}

                {recordSub==='cash_ledger' && (
                  <div className="space-y-3">
                    {!settingsUnlocked ? (
                      <div className="rounded-[1.5rem] border border-orange-500/30 bg-orange-500/10 p-6 text-center"><p className="text-xs font-black text-orange-300">LOCKED - ADMIN ONLY TABLE</p><p className="text-[10px] opacity-60 mt-2">Staff can add cash in FORMS but only admin can view ledger. Unlock in Settings.</p><button onClick={()=>setTab('settings')} className="mt-3 bg-orange-500 text-black px-4 py-2 rounded-full text-xs font-black">GO TO SETTINGS</button></div>
                    ) : (
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                        <div className="flex justify-between mb-2"><p className="font-black text-xs">CASH LEDGER (Admin Only) - {cashList.length}</p><p className="text-xs opacity-50">Balance: Rs {cashList.filter((t:any)=>t.type==='lut').reduce((a:any,b:any)=>a+Number(b.amount||0),0) - cashList.filter((t:any)=>t.type==='chhuak').reduce((a:any,b:any)=>a+Number(b.amount||0),0)}</p></div>
                        <div className="divide-y divide-white/5 max-h-[70vh] overflow-auto">
                          {cashList.map((t:any)=>(
                            <div key={t.id} className="py-2 flex justify-between text-xs items-center"><div><p className="font-bold">{t.reason} - {t.payment_mode}</p><p className="opacity-40 text-[10px]">{new Date(t.created_at).toLocaleString()}</p></div><div className="flex items-center gap-2"><span className={t.type==='lut'? 'text-green-400 font-black':'text-red-400 font-black'}>{t.type==='lut'?'+':'-'} Rs {Number(t.amount).toLocaleString()}</span><button onClick={()=>requestDelete('cash_ledger', t.id)} className="bg-red-600/20 text-red-400 px-2 py-1 rounded-full text-[10px]">DEL</button></div></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {recordSub==='transactions' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-black text-xs mb-2">ALL TRANSACTIONS ({list.length})</p>
                    <div className="divide-y divide-white/5 max-h-[70vh] overflow-auto">
                      {list.map((t:any)=>(
                        <div key={t.id} className="py-2 flex justify-between text-xs"><span className="opacity-60 truncate">{t.reason} | {new Date(t.created_at).toLocaleDateString()} | Rs {t.amount}</span><button onClick={()=>requestDelete('trans', t.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full">DEL</button></div>
                      ))}
                    </div>
                  </div>
                )}

                {recordSub==='finance_journal' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-black text-xs mb-2">FINANCE JOURNAL ({financeJournal.length}) + Auto Records</p>
                    <div className="flex gap-2 mb-2 overflow-x-auto">
                      {['all','sale','purchase','salary','expense','service'].map(f=>(
                        <button key={f} onClick={()=>setFinanceFilter(f as any)} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${financeFilter===f? 'bg-white text-black':'bg-white/10'}`}>{f}</button>
                      ))}
                    </div>
                    <div className="space-y-1 max-h-[70vh] overflow-auto">
                      {financeJournal.filter((j:any)=> financeFilter==='all' || j.type===financeFilter).map((j:any)=>(
                        <div key={j.id} className="py-2 px-3 rounded-xl bg-white/[0.04] flex justify-between text-xs"><div className="flex gap-2 items-center"><span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${j.type==='sale'?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400'}`}>{j.type.toUpperCase()}</span><div><p className="font-bold">{j.reason} - {j.category}</p><p className="opacity-40 text-[10px]">{new Date(j.created_at).toLocaleString()}</p></div></div><div className="flex gap-2"><span className="font-black">Rs {Number(j.amount).toLocaleString()}</span><button onClick={()=>requestDelete('finance_journal', j.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full text-[9px]">DEL</button></div></div>
                      ))}
                      {cust.slice(0,15).map((c:any)=>(
                        <div key={'cust-'+c.id} className="py-2 px-3 rounded-xl bg-green-500/5 flex justify-between text-xs"><span>AUTO-SALE: {c.customer_name || c.name} - {c.vehicle_type || c.model_name}</span><span className="font-black text-green-400">Rs {Number(c.total_amount||0).toLocaleString()}</span></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'cash' && (
              <div className="space-y-3">
                <div className="rounded-[1.5rem] border border-green-500/30 bg-white/[0.05] p-4">
                  <p className="text-[10px] uppercase tracking-[0.3em]">QUICK CASH ENTRY</p>
                  <div className="flex gap-2 mb-2 mt-3"><button onClick={() => setCashT('lut')} className={`flex-1 py-2 rounded-full text-xs font-black ${cashT === 'lut'? 'bg-green-500 text-black' : 'bg-white/5'}`}>LUT IN</button><button onClick={() => setCashT('chhuak')} className={`flex-1 py-2 rounded-full text-xs font-black ${cashT === 'chhuak'? 'bg-red-600 text-white' : 'bg-white/5'}`}>CHHUAK OUT</button></div>
                  <input value={cashR} onChange={(e) => setCashR(e.target.value)} placeholder="Reason" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-xs mb-2" />
                  <div className="grid grid-cols-2 gap-2"><input value={cashA} onChange={(e) => setCashA(e.target.value)} type="number" placeholder="Amount" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" /><select value={cashM} onChange={(e) => setCashM(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>Cash</option><option>UPI</option></select></div>
                  <button onClick={addCash} className="w-full mt-3 bg-white text-black py-3 rounded-xl font-black text-xs">ADD ENTRY</button>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-black text-xs mb-2">Recent Cash ({cashList.slice(0,5).length}) - Full in RECORDS</p>
                  <div className="divide-y divide-white/5">
                    {cashList.slice(0,5).map((t:any)=>(
                      <div key={t.id} className="py-2 flex justify-between text-xs"><span>{t.reason} | Rs {t.amount}</span><span className={t.type==='lut'? 'text-green-400':'text-red-400'}>{t.type}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'bills' && (
              <div className="space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[{id:'create', label:'Create Bill'}, {id:'list', label:'All Bills'}, {id:'business', label:'Business / GSTIN'}].map((b:any)=>(
                    <button key={b.id} onClick={()=>setBillSub(b.id)} className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap ${billSub===b.id? 'bg-white text-black':'bg-white/10'}`}>{b.label}</button>
                  ))}
                </div>

                {billSub==='business' && (
                  <div className="rounded-[1.5rem] border border-yellow-500/30 bg-white/[0.05] p-4">
                    <p className="font-black text-xs mb-3">BUSINESS INFO - GSTIN CUSTOMIZABLE FOR BILLS</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={businessInfo.name} onChange={(e)=>setBusinessInfo({...businessInfo, name:e.target.value})} placeholder="Business Name" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs col-span-2" />
                      <input value={businessInfo.gstin} onChange={(e)=>setBusinessInfo({...businessInfo, gstin:e.target.value.toUpperCase()})} placeholder="GSTIN" className="bg-black/50 border border-yellow-500/30 p-3 rounded-xl text-xs font-mono" />
                      <input value={businessInfo.phone} onChange={(e)=>setBusinessInfo({...businessInfo, phone:e.target.value})} placeholder="Phone" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <input value={businessInfo.address} onChange={(e)=>setBusinessInfo({...businessInfo, address:e.target.value})} placeholder="Full Address" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs col-span-2" />
                      <input value={businessInfo.email} onChange={(e)=>setBusinessInfo({...businessInfo, email:e.target.value})} placeholder="Email" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <input value={businessInfo.state} onChange={(e)=>setBusinessInfo({...businessInfo, state:e.target.value})} placeholder="State" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <input value={businessInfo.stateCode} onChange={(e)=>setBusinessInfo({...businessInfo, stateCode:e.target.value})} placeholder="State Code (15)" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <input value={businessInfo.invoicePrefix} onChange={(e)=>setBusinessInfo({...businessInfo, invoicePrefix:e.target.value.toUpperCase()})} placeholder="Prefix" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                    </div>
                    <button onClick={()=>{ localStorage.setItem('hravo_business_info_obj', JSON.stringify(businessInfo)); writeLocalList('hravo_business_info', [businessInfo]); alert('Saved GSTIN: '+businessInfo.gstin); }} className="w-full mt-3 bg-yellow-500 text-black py-3 rounded-xl font-black text-xs">SAVE BUSINESS INFO</button>
                  </div>
                )}

                {billSub==='create' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                    <p className="font-black text-xs mb-3">CREATE BILL - {businessInfo.name} | GSTIN: {businessInfo.gstin}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      <select value={billType} onChange={(e)=>{ setBillType(e.target.value); if(e.target.value==='insurance') setBillItems([{desc:'Insurance - 1 Year', hsn:'9971', qty:1, rate:2500, amount:2500}]); if(e.target.value==='vehicle_sale') setBillItems([{desc:'Hero Splendor Plus', hsn:'8711', qty:1, rate:85000, amount:85000}]); if(e.target.value==='service') setBillItems([{desc:'General Service', hsn:'9987', qty:1, rate:500, amount:500}]); }} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs">
                        <option value="vehicle_sale">Vehicle Sale (Auto Bill)</option>
                        <option value="insurance">Insurance Bill</option>
                        <option value="service">Service Bill</option>
                        <option value="parts">Parts Bill</option>
                        <option value="general">General Bill</option>
                      </select>
                      <select onChange={(e)=>{ const c=cust.find((x:any)=>x.id===e.target.value); if(c){ setBillCustomerName(c.customer_name||c.name); setBillCustomerPhone(c.phone); setBillCustomerAddr(c.address||''); setBillVehicleModel(c.model_name||''); setBillChassis(c.chassis_no||''); setBillEngine(c.engine_no||''); } }} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs">
                        <option value="">Select Customer Auto-fill</option>
                        {cust.map((c:any)=><option key={c.id} value={c.id}>{c.customer_name||c.name} - {c.phone}</option>)}
                      </select>
                      <input value={billGstPercent} onChange={(e)=>setBillGstPercent(e.target.value)} type="number" placeholder="GST %" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <select value={billPaymentMode} onChange={(e)=>setBillPaymentMode(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>Cash</option><option>UPI</option><option>Finance</option><option>Bank Transfer</option></select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input value={billCustomerName} onChange={(e)=>setBillCustomerName(e.target.value)} placeholder="Customer Name" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <input value={billCustomerPhone} onChange={(e)=>setBillCustomerPhone(e.target.value)} placeholder="Phone" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <input value={billCustomerAddr} onChange={(e)=>setBillCustomerAddr(e.target.value)} placeholder="Address" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <input value={billCustomerGstin} onChange={(e)=>setBillCustomerGstin(e.target.value)} placeholder="Customer GSTIN (Optional)" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                    </div>
                    {(billType==='vehicle_sale' || billType==='insurance') && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <input value={billVehicleModel} onChange={(e)=>setBillVehicleModel(e.target.value)} placeholder="Model" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                        <input value={billChassis} onChange={(e)=>setBillChassis(e.target.value)} placeholder="Chassis" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                        <input value={billEngine} onChange={(e)=>setBillEngine(e.target.value)} placeholder="Engine" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      </div>
                    )}
                    <p className="text-[10px] font-black opacity-50 mt-3 mb-2">ITEMS</p>
                    <div className="space-y-2">
                      {billItems.map((it:any, idx:number)=>(
                        <div key={idx} className="grid grid-cols-12 gap-1 items-center">
                          <input value={it.desc} onChange={(e)=>{ const n=[...billItems]; n[idx].desc=e.target.value; setBillItems(n); }} className="col-span-5 bg-black/50 border border-white/10 p-2 rounded-lg text-xs" />
                          <input value={it.hsn} onChange={(e)=>{ const n=[...billItems]; n[idx].hsn=e.target.value; setBillItems(n); }} placeholder="HSN" className="col-span-2 bg-black/50 border border-white/10 p-2 rounded-lg text-xs" />
                          <input value={it.qty} onChange={(e)=>{ const n=[...billItems]; n[idx].qty=Number(e.target.value); n[idx].amount=n[idx].qty*n[idx].rate; setBillItems(n); }} type="number" className="col-span-1 bg-black/50 border border-white/10 p-2 rounded-lg text-xs" />
                          <input value={it.rate} onChange={(e)=>{ const n=[...billItems]; n[idx].rate=Number(e.target.value); n[idx].amount=n[idx].qty*n[idx].rate; setBillItems(n); }} type="number" className="col-span-2 bg-black/50 border border-white/10 p-2 rounded-lg text-xs" />
                          <span className="col-span-1 text-xs font-black">₹{it.amount}</span>
                          <button onClick={()=>setBillItems(billItems.filter((_,i)=>i!==idx))} className="col-span-1 bg-red-500/20 text-red-400 rounded-lg p-1 text-xs">X</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>setBillItems([...billItems, {desc:'New Item', hsn:'', qty:1, rate:0, amount:0}])} className="mt-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black">+ ADD ITEM</button>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <input value={billDiscount} onChange={(e)=>setBillDiscount(e.target.value)} type="number" placeholder="Discount" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <input value={billPaid} onChange={(e)=>setBillPaid(e.target.value)} type="number" placeholder="Paid" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <input value={billNotes} onChange={(e)=>setBillNotes(e.target.value)} placeholder="Notes" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                    </div>
                    {(() => { const sub=billItems.reduce((a:any,b:any)=>a+Number(b.amount||0),0); const gst=sub*Number(billGstPercent||0)/100; const tot=sub+gst-Number(billDiscount||0); return <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs"><div className="flex justify-between"><span>Subtotal ₹{sub.toLocaleString()}</span><span>GST ₹{gst.toLocaleString()} Total ₹{tot.toLocaleString()}</span></div></div>; })()}
                    <button onClick={async()=>{
                      const sub=billItems.reduce((a:any,b:any)=>a+Number(b.amount||0),0); const gst=sub*Number(billGstPercent||0)/100; const tot=sub+gst-Number(billDiscount||0); const invNo=`${businessInfo.invoicePrefix}-${Date.now().toString().slice(-6)}`;
                      const bill={ id:Date.now(), invoice_no:invNo, type:billType, customer_name:billCustomerName, customer_phone:billCustomerPhone, customer_address:billCustomerAddr, customer_gstin:billCustomerGstin, vehicle_model:billVehicleModel, chassis_no:billChassis, engine_no:billEngine, items:billItems, subtotal:sub, gst_percent:Number(billGstPercent), gst_amount:gst, discount:Number(billDiscount), total_amount:tot, paid_amount:Number(billPaid||0), due_amount:tot-Number(billPaid||0), payment_mode:billPaymentMode, notes:billNotes, business_name:businessInfo.name, business_gstin:businessInfo.gstin, business_address:businessInfo.address, business_phone:businessInfo.phone, business_state:businessInfo.state, created_at:new Date().toISOString() };
                      try { const {data}=await getSupabase().from('bills').insert([bill]).select(); if(data&&data[0]) setBillsList([data[0],...billsList]); else { const loc=[bill,...readLocalList('hravo_bills')]; writeLocalList('hravo_bills',loc); setBillsList(loc); } } catch { const loc=[bill,...readLocalList('hravo_bills')]; writeLocalList('hravo_bills',loc); setBillsList(loc); }
                      setSelectedBill(bill); setShowBillPrint(true); load();
                    }} className="w-full mt-3 bg-white text-black py-3 rounded-xl font-black text-xs">GENERATE & PRINT BILL</button>
                  </div>
                )}

                {billSub==='list' && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-black text-xs mb-2">ALL BILLS ({billsList.length})</p>
                    <div className="divide-y divide-white/5 max-h-[70vh] overflow-auto">
                      {billsList.map((b:any)=>(
                        <div key={b.id} className="py-2 flex justify-between text-xs"><div><p className="font-bold">{b.invoice_no} - {b.type} - {b.customer_name} ₹{Number(b.total_amount).toLocaleString()}</p><p className="opacity-40 text-[10px]">{new Date(b.created_at).toLocaleString()} GSTIN:{b.business_gstin}</p></div><div className="flex gap-1"><button onClick={()=>{setSelectedBill(b); setShowBillPrint(true);}} className="bg-white/10 px-2 py-1 rounded-full text-[9px]">PRINT</button><button onClick={()=>{ const loc=readLocalList('hravo_bills').filter((x:any)=>x.id!==b.id); writeLocalList('hravo_bills',loc); setBillsList(loc); }} className="bg-red-600/20 text-red-400 px-2 py-1 rounded-full text-[9px]">DEL</button></div></div>
                      ))}
                    </div>
                  </div>
                )}

                {showBillPrint && selectedBill && (
                  <div className="fixed inset-0 z-[200] bg-white text-black overflow-auto p-4">
                    <div className="max-w-[800px] mx-auto bg-white p-8 border">
                      <div className="flex justify-between border-b-2 border-black pb-4">
                        <div><h1 className="text-2xl font-black">{selectedBill.business_name}</h1><p className="text-xs">{selectedBill.business_address} Phone:{selectedBill.business_phone} GSTIN:{selectedBill.business_gstin}</p></div>
                        <div className="text-right"><p className="font-black">{selectedBill.type==='vehicle_sale'?'TAX INVOICE': selectedBill.type==='insurance'?'INSURANCE BILL':'BILL'}</p><p className="text-xs">{selectedBill.invoice_no} Date:{new Date(selectedBill.created_at).toLocaleDateString()}</p></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4 text-xs border-b pb-4">
                        <div><p className="font-black">Bill To</p><p className="font-bold">{selectedBill.customer_name} {selectedBill.customer_phone}</p><p>{selectedBill.customer_address}</p>{selectedBill.customer_gstin && <p>GSTIN:{selectedBill.customer_gstin}</p>}{selectedBill.vehicle_model && <p>Model:{selectedBill.vehicle_model} Chassis:{selectedBill.chassis_no} Engine:{selectedBill.engine_no}</p>}</div>
                        <div className="text-right"><p>Payment:{selectedBill.payment_mode} Total:₹{Number(selectedBill.total_amount).toLocaleString()} Paid:₹{Number(selectedBill.paid_amount).toLocaleString()} Due:₹{Number(selectedBill.due_amount).toLocaleString()}</p></div>
                      </div>
                      <table className="w-full mt-4 text-xs border-collapse"><thead><tr className="border-b-2 border-black bg-black/5"><th className="text-left p-2">Desc</th><th>HSN</th><th>Qty</th><th className="text-right">Rate</th><th className="text-right">Amt</th></tr></thead><tbody>{(selectedBill.items||[]).map((it:any,i:number)=><tr key={i} className="border-b"><td className="p-2">{it.desc}</td><td className="text-center">{it.hsn}</td><td className="text-center">{it.qty}</td><td className="text-right">₹{Number(it.rate).toLocaleString()}</td><td className="text-right">₹{Number(it.amount).toLocaleString()}</td></tr>)}</tbody></table>
                      <div className="flex justify-end mt-4"><div className="w-64 text-xs"><div className="flex justify-between"><span>Subtotal</span><span>₹{Number(selectedBill.subtotal).toLocaleString()}</span></div><div className="flex justify-between"><span>GST {selectedBill.gst_percent}%</span><span>₹{Number(selectedBill.gst_amount).toLocaleString()}</span></div><div className="flex justify-between"><span>Discount</span><span>-₹{Number(selectedBill.discount).toLocaleString()}</span></div><div className="flex justify-between font-black border-t-2 border-black pt-1"><span>Total</span><span>₹{Number(selectedBill.total_amount).toLocaleString()}</span></div></div></div>
                      <div className="mt-6 text-[10px]"><p>Notes:{selectedBill.notes}</p><div className="flex justify-between mt-12"><p>Customer Sign</p><p>For {selectedBill.business_name}</p></div></div>
                      <div className="mt-8 flex gap-2 no-print"><button onClick={()=>window.print()} className="flex-1 bg-black text-white py-3 rounded-xl font-black text-xs">PRINT</button><button onClick={()=>setShowBillPrint(false)} className="flex-1 bg-white border py-3 rounded-xl font-black text-xs">CLOSE</button></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'finance' && (
              <div className="space-y-3">
                {!settingsUnlocked ? (
                  <div className="rounded-[1.5rem] border border-orange-500/30 bg-orange-500/10 p-6 text-center">
                    <p className="text-sm font-black text-orange-300">FINANCE - ADMIN ONLY</p>
                    <p className="text-xs opacity-60 mt-2">Unlock in sidebar Admin Unlock to view full financial system</p>
                    <div className="mt-4 flex gap-2 justify-center">
                      <input value={settingsPass} onChange={(e)=>setSettingsPass(e.target.value)} type="password" placeholder="Admin Password" className="bg-black/50 border border-orange-500/30 p-3 rounded-xl text-xs outline-none" />
                      <button onClick={unlockSettings} className="bg-orange-500 text-black px-6 rounded-xl font-black text-xs">UNLOCK</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {[
                        { id: 'dashboard', label: 'Dashboard' },
                        { id: 'capital', label: 'Capital' },
                        { id: 'loans', label: 'Borrowing/Loans' },
                        { id: 'payables', label: 'Payables (Hero/Supplier)' },
                        { id: 'expenses', label: 'Expenses' },
                        { id: 'assets', label: 'Assets' },
                        { id: 'pl', label: 'P&L Report' },
                        { id: 'balancesheet', label: 'Balance Sheet' },
                        { id: 'cashflow', label: 'Cashflow' },
                        { id: 'journal', label: 'Journal' },
                      ].map((fs:any) => (
                        <button key={fs.id} onClick={()=>setFinanceSub(fs.id)} className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap ${financeSub===fs.id ? 'bg-white text-black' : 'bg-white/10'}`}>{fs.label}</button>
                      ))}
                    </div>

                    {financeSub === 'dashboard' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-4"><p className="text-[10px] opacity-50 uppercase">Total Capital</p><p className="text-lg font-black text-green-400">₹{(capitalList.filter((c:any)=>c.type==='capital_in').reduce((a:any,b:any)=>a+Number(b.amount||0),0) - capitalList.filter((c:any)=>c.type==='withdrawal').reduce((a:any,b:any)=>a+Number(b.amount||0),0)).toLocaleString()}</p><p className="text-[9px] opacity-40">Invested - Withdrawn</p></div>
                          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4"><p className="text-[10px] opacity-50 uppercase">Loans Outstanding</p><p className="text-lg font-black text-red-400">₹{loansList.reduce((a:any,b:any)=>a+Number(b.outstanding_amount||b.principal_amount||0),0).toLocaleString()}</p><p className="text-[9px] opacity-40">{loansList.filter((l:any)=>l.status==='active').length} active loans</p></div>
                          <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4"><p className="text-[10px] opacity-50 uppercase">Vendor Payables</p><p className="text-lg font-black text-blue-400">₹{vendorPayables.reduce((a:any,b:any)=>a+Number(b.due_amount || (Number(b.total_amount || 0) - Number(b.paid_amount || 0))),0).toLocaleString()}</p><p className="text-[9px] opacity-40">To Hero + Suppliers</p></div>
                          <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-4"><p className="text-[10px] opacity-50 uppercase">Net Profit (Est)</p><p className="text-lg font-black text-yellow-400">₹{(() => { const sales = cust.reduce((a:any,b:any)=>a+Number(b.total_amount||0),0) + service.reduce((a:any,b:any)=>a+Number(b.amount||0),0); const ex = expensesList.reduce((a:any,b:any)=>a+Number(b.amount||0),0); return (sales - ex).toLocaleString(); })()}</p><p className="text-[9px] opacity-40">Sales - Expenses</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-white/5 border border-white/10 p-4"><p className="text-[10px] opacity-50 uppercase">Cash In Hand</p><p className="text-xl font-black">₹{bal.toLocaleString()}</p><p className="text-[10px] opacity-40">From cash_ledger + transactions</p></div>
                          <div className="rounded-2xl bg-white/5 border border-white/10 p-4"><p className="text-[10px] opacity-50 uppercase">Customer Due</p><p className="text-xl font-black text-orange-400">₹{due.toLocaleString()}</p><p className="text-[10px] opacity-40">{cust.filter((c:any)=>Number(c.due_amount||0)>0).length} customers pending</p></div>
                        </div>
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                          <p className="font-black text-xs mb-2">Quick Add</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button onClick={()=>setFinanceSub('capital')} className="bg-green-500/20 border border-green-500/30 p-3 rounded-xl text-xs font-black">+ Capital</button>
                            <button onClick={()=>setFinanceSub('loans')} className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl text-xs font-black">+ Loan/Borrow</button>
                            <button onClick={()=>setFinanceSub('payables')} className="bg-blue-500/20 border border-blue-500/30 p-3 rounded-xl text-xs font-black">+ Payable</button>
                            <button onClick={()=>setFinanceSub('expenses')} className="bg-white/10 border border-white/20 p-3 rounded-xl text-xs font-black">+ Expense</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {financeSub === 'capital' && (
                      <div className="space-y-3">
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                          <p className="font-black text-xs mb-3">Add Capital / Withdrawal</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <select value={capType} onChange={(e)=>setCapType(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option value="capital_in">Capital IN (Investment)</option><option value="withdrawal">Withdrawal OUT</option><option value="profit_add">Profit Added to Capital</option></select>
                            <input value={capAmount} onChange={(e)=>setCapAmount(e.target.value)} type="number" placeholder="Amount" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                            <input value={capSource} onChange={(e)=>setCapSource(e.target.value)} placeholder="Source (Owner, Bank, etc)" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                            <input value={capDesc} onChange={(e)=>setCapDesc(e.target.value)} placeholder="Description" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                          </div>
                          <button onClick={async()=>{
                            if(!capAmount) return; const sup=getSupabase(); const payload={type:capType, amount:Number(capAmount), source:capSource, description:capDesc}; try{ const {data}=await sup.from('capital_accounts').insert([payload]).select(); if(data&&data[0]) setCapitalList([data[0],...capitalList]); }catch{ const local=[{...payload,id:Date.now(),created_at:new Date().toISOString()},...readLocalList('hravo_capital')]; writeLocalList('hravo_capital',local); setCapitalList(local);} setCapAmount(''); setCapDesc(''); load();
                          }} className="w-full mt-3 bg-white text-black py-3 rounded-xl font-black text-xs">ADD CAPITAL ENTRY</button>
                        </div>
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                          <p className="font-black text-xs mb-2">Capital History ({capitalList.length})</p>
                          <div className="divide-y divide-white/5 max-h-[60vh] overflow-auto">
                            {capitalList.map((c:any)=>(
                              <div key={c.id} className="py-2 flex justify-between text-xs"><div><p className="font-bold">{c.type.toUpperCase()} - {c.source}</p><p className="opacity-40 text-[10px]">{new Date(c.created_at).toLocaleString()} | {c.description}</p></div><div className="flex gap-2 items-center"><span className={`font-black ${c.type==='capital_in' ? 'text-green-400' : 'text-red-400'}`}>{c.type==='withdrawal' ? '-' : '+'}₹{Number(c.amount).toLocaleString()}</span><button onClick={()=>requestDelete('capital', c.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full text-[9px]">DEL</button></div></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {financeSub === 'loans' && (
                      <div className="space-y-3">
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                          <p className="font-black text-xs mb-3">Add New Loan / Borrowing</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <input value={loanLender} onChange={(e)=>setLoanLender(e.target.value)} placeholder="Lender Name (SBI, Friend, etc)" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                            <select value={loanType} onChange={(e)=>setLoanType(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>Bank</option><option>Private</option><option>Hero Finance</option><option>NBFC</option><option>Other</option></select>
                            <input value={loanPrincipal} onChange={(e)=>setLoanPrincipal(e.target.value)} type="number" placeholder="Principal Amount" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                            <input value={loanInterest} onChange={(e)=>setLoanInterest(e.target.value)} type="number" placeholder="Interest % per year" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                            <input value={loanTenure} onChange={(e)=>setLoanTenure(e.target.value)} type="number" placeholder="Tenure Months" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                            <input value={loanEmi} onChange={(e)=>setLoanEmi(e.target.value)} type="number" placeholder="EMI Amount (optional)" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                          </div>
                          <button onClick={async()=>{
                            if(!loanLender||!loanPrincipal) return; const sup=getSupabase(); const outstanding=Number(loanPrincipal); const payload={lender_name:loanLender, loan_type:loanType, principal_amount:Number(loanPrincipal), interest_rate:Number(loanInterest||0), tenure_months:Number(loanTenure||12), emi_amount:Number(loanEmi||0), outstanding_amount:outstanding, status:'active'}; try{ const {data}=await sup.from('loans').insert([payload]).select(); if(data&&data[0]) setLoansList([data[0],...loansList]); }catch{ const local=[{...payload,id:Date.now(),created_at:new Date().toISOString()},...readLocalList('hravo_loans')]; writeLocalList('hravo_loans',local); setLoansList(local);} setLoanLender(''); setLoanPrincipal(''); setLoanEmi(''); load();
                          }} className="w-full mt-3 bg-red-600 text-white py-3 rounded-xl font-black text-xs">ADD LOAN</button>
                        </div>
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                          <p className="font-black text-xs mb-3">Loans ({loansList.length}) - Outstanding ₹{loansList.reduce((a:any,b:any)=>a+Number(b.outstanding_amount||0),0).toLocaleString()}</p>
                          <div className="space-y-2 max-h-[40vh] overflow-auto">
                            {loansList.map((l:any)=>(
                              <div key={l.id} className="p-3 rounded-xl bg-white/[0.04] flex justify-between text-xs"><div><p className="font-bold">{l.lender_name} - {l.loan_type} | {l.interest_rate}% | {l.tenure_months}m</p><p className="opacity-40 text-[10px]">Principal ₹{Number(l.principal_amount).toLocaleString()} | Outstanding ₹{Number(l.outstanding_amount).toLocaleString()} | EMI ₹{Number(l.emi_amount).toLocaleString()} | {new Date(l.created_at).toLocaleDateString()}</p></div><div className="flex gap-1"><button onClick={()=>{setPayLoanId(l.id); setPayAmount(String(l.emi_amount || '')); setFinanceSub('loans');}} className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-[9px]">PAY EMI</button><button onClick={()=>requestDelete('loan', l.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full text-[9px]">DEL</button></div></div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                          <p className="font-black text-xs mb-3">Record EMI Payment</p>
                          <div className="grid grid-cols-3 gap-2">
                            <select value={payLoanId} onChange={(e)=>setPayLoanId(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option value="">Select Loan</option>{loansList.map((l:any)=><option key={l.id} value={l.id}>{l.lender_name} - Outstanding ₹{Number(l.outstanding_amount).toLocaleString()}</option>)}</select>
                            <input value={payAmount} onChange={(e)=>setPayAmount(e.target.value)} type="number" placeholder="Payment Amount" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                            <button onClick={async()=>{
                              if(!payLoanId || !payAmount) return; const sup=getSupabase(); const loan=loansList.find((l:any)=>l.id===payLoanId); if(!loan) return; const amt=Number(payAmount); const interest=Math.round((Number(loan.outstanding_amount||0) * Number(loan.interest_rate||0) / 100) / 12); const principal=Math.max(0, amt - interest); const payload={loan_id:payLoanId, amount:amt, interest_part:interest, principal_part:principal, payment_date:new Date().toISOString().split('T')[0]}; try{ await sup.from('loan_payments').insert([payload]); await sup.from('loans').update({outstanding_amount:Math.max(0, Number(loan.outstanding_amount||0)-principal), total_paid:Number(loan.total_paid||0)+amt}).eq('id', payLoanId); }catch{ const local=[{...payload,id:Date.now(),created_at:new Date().toISOString()},...readLocalList('hravo_loan_payments')]; writeLocalList('hravo_loan_payments',local);} setPayAmount(''); setPayLoanId(''); load(); alert(`Paid ₹${amt} - Interest ₹${interest}, Principal ₹${principal}`);
                            }} className="bg-green-500 text-black py-3 rounded-xl font-black text-xs">PAY EMI</button>
                          </div>
                          <div className="mt-3 divide-y divide-white/5 max-h-32 overflow-auto">
                            {loanPayments.slice(0,10).map((p:any)=>(
                              <div key={p.id} className="py-1 flex justify-between text-[10px]"><span>Loan {String(p.loan_id).slice(0,8)} - ₹{Number(p.amount).toLocaleString()} (Int ₹{Number(p.interest_part)} Prin ₹{Number(p.principal_part)})</span><span className="opacity-40">{new Date(p.created_at || p.payment_date).toLocaleDateString()}</span></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {financeSub === 'payables' && (
                      <div className="space-y-3">
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                          <p className="font-black text-xs mb-3">Add Vendor Payable (What you owe to Hero / Supplier)</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <input value={vpName} onChange={(e)=>setVpName(e.target.value)} placeholder="Vendor Name (Hero Motors, etc)" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                            <select value={vpType} onChange={(e)=>setVpType(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>Hero Company</option><option>Parts Supplier</option><option>Other</option></select>
                            <input value={vpTotal} onChange={(e)=>setVpTotal(e.target.value)} type="number" placeholder="Total Amount" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                            <input value={vpPaid} onChange={(e)=>setVpPaid(e.target.value)} type="number" placeholder="Paid Amount" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                          </div>
                          <button onClick={async()=>{
                            if(!vpName || !vpTotal) return; const sup=getSupabase(); const total=Number(vpTotal); const paid=Number(vpPaid || 0); const due=total-paid; const payload={vendor_name:vpName, vendor_type:vpType, total_amount:total, paid_amount:paid, due_amount:due, status:due<=0 ? 'paid' : paid>0 ? 'partial' : 'pending'}; try{ const {data}=await sup.from('vendor_payables').insert([payload]).select(); if(data&&data[0]) setVendorPayables([data[0],...vendorPayables]); }catch{ const local=[{...payload,id:Date.now(),created_at:new Date().toISOString()},...readLocalList('hravo_vendor_payables')]; writeLocalList('hravo_vendor_payables',local); setVendorPayables(local);} setVpName(''); setVpTotal(''); setVpPaid('0'); load();
                          }} className="w-full mt-3 bg-blue-600 text-white py-3 rounded-xl font-black text-xs">ADD PAYABLE</button>
                        </div>
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                          <p className="font-black text-xs mb-2">Payables ({vendorPayables.length}) - Due ₹{vendorPayables.reduce((a:any,b:any)=>a+Number(b.due_amount||0),0).toLocaleString()}</p>
                          <div className="divide-y divide-white/5 max-h-[60vh] overflow-auto">
                            {vendorPayables.map((v:any)=>(
                              <div key={v.id} className="py-2 flex justify-between text-xs"><div><p className="font-bold">{v.vendor_name} - {v.vendor_type} | Status {v.status}</p><p className="opacity-40 text-[10px]">Total ₹{Number(v.total_amount).toLocaleString()} Paid ₹{Number(v.paid_amount).toLocaleString()} Due ₹{Number(v.due_amount).toLocaleString()} | {new Date(v.created_at).toLocaleDateString()}</p></div><button onClick={()=>requestDelete('vendor_payable', v.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full text-[9px]">DEL</button></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {financeSub === 'expenses' && (
                      <div className="space-y-3">
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                          <p className="font-black text-xs mb-3">Add Expense (Rent, Salary, Electricity, etc)</p>
                          <div className="grid grid-cols-3 gap-2">
                            <select value={exCat} onChange={(e)=>setExCat(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>Rent</option><option>Salary</option><option>Electricity</option><option>Water</option><option>Internet</option><option>Marketing</option><option>Transport</option><option>Maintenance</option><option>Office</option><option>Other</option></select>
                            <input value={exDesc} onChange={(e)=>setExDesc(e.target.value)} placeholder="Description" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                            <input value={exAmount} onChange={(e)=>setExAmount(e.target.value)} type="number" placeholder="Amount" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                          </div>
                          <button onClick={async()=>{
                            if(!exAmount) return; const sup=getSupabase(); const payload={category:exCat, description:exDesc, amount:Number(exAmount), expense_date:new Date().toISOString().split('T')[0]}; try{ const {data}=await sup.from('expenses').insert([payload]).select(); if(data&&data[0]) setExpensesList([data[0],...expensesList]); }catch{ const local=[{...payload,id:Date.now(),created_at:new Date().toISOString()},...readLocalList('hravo_expenses')]; writeLocalList('hravo_expenses',local); setExpensesList(local);} setExAmount(''); setExDesc(''); load();
                          }} className="w-full mt-3 bg-white text-black py-3 rounded-xl font-black text-xs">ADD EXPENSE</button>
                        </div>
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                          <p className="font-black text-xs mb-2">Expenses ({expensesList.length}) - Total ₹{expensesList.reduce((a:any,b:any)=>a+Number(b.amount||0),0).toLocaleString()}</p>
                          <div className="divide-y divide-white/5 max-h-[60vh] overflow-auto">
                            {expensesList.map((e:any)=>(
                              <div key={e.id} className="py-2 flex justify-between text-xs"><div><p className="font-bold">{e.category} - {e.description}</p><p className="opacity-40 text-[10px]">{new Date(e.created_at).toLocaleDateString()}</p></div><div className="flex gap-2"><span className="font-black text-red-400">-₹{Number(e.amount).toLocaleString()}</span><button onClick={()=>requestDelete('expense', e.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full text-[9px]">DEL</button></div></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {financeSub === 'assets' && (
                      <div className="space-y-3">
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                          <p className="font-black text-xs mb-3">Add Asset (Furniture, Tools, Computer)</p>
                          <div className="grid grid-cols-3 gap-2">
                            <input value={assetName} onChange={(e)=>setAssetName(e.target.value)} placeholder="Asset Name" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                            <select value={assetCat} onChange={(e)=>setAssetCat(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>Furniture</option><option>Tools</option><option>Computer</option><option>Vehicle</option><option>Building</option><option>Other</option></select>
                            <input value={assetCost} onChange={(e)=>setAssetCost(e.target.value)} type="number" placeholder="Purchase Cost" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                          </div>
                          <button onClick={async()=>{
                            if(!assetName || !assetCost) return; const sup=getSupabase(); const payload={name:assetName, category:assetCat, purchase_cost:Number(assetCost), current_value:Number(assetCost)}; try{ const {data}=await sup.from('assets').insert([payload]).select(); if(data&&data[0]) setAssetsList([data[0],...assetsList]); }catch{ const local=[{...payload,id:Date.now(),created_at:new Date().toISOString()},...readLocalList('hravo_assets')]; writeLocalList('hravo_assets',local); setAssetsList(local);} setAssetName(''); setAssetCost(''); load();
                          }} className="w-full mt-3 bg-white text-black py-3 rounded-xl font-black text-xs">ADD ASSET</button>
                        </div>
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                          <p className="font-black text-xs mb-2">Assets ({assetsList.length}) - Value ₹{assetsList.reduce((a:any,b:any)=>a+Number(b.current_value || b.purchase_cost || 0),0).toLocaleString()}</p>
                          <div className="divide-y divide-white/5 max-h-[60vh] overflow-auto">
                            {assetsList.map((a:any)=>(
                              <div key={a.id} className="py-2 flex justify-between text-xs"><div><p className="font-bold">{a.name} - {a.category}</p><p className="opacity-40 text-[10px]">Cost ₹{Number(a.purchase_cost).toLocaleString()} | Current ₹{Number(a.current_value || a.purchase_cost).toLocaleString()}</p></div><button onClick={()=>requestDelete('asset', a.id)} className="bg-red-600/20 text-red-400 px-2 rounded-full text-[9px]">DEL</button></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {financeSub === 'pl' && (
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 space-y-3">
                        <p className="font-black text-sm">PROFIT & LOSS REPORT</p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-green-500/10 p-3 rounded-xl"><p className="opacity-50">Total Sales (Bike+Service)</p><p className="font-black text-lg text-green-400">₹{(cust.reduce((a:any,b:any)=>a+Number(b.total_amount||0),0) + service.reduce((a:any,b:any)=>a+Number(b.amount||0),0) + insure.reduce((a:any,b:any)=>a+Number(b.amount||0),0)).toLocaleString()}</p></div>
                          <div className="bg-red-500/10 p-3 rounded-xl"><p className="opacity-50">Total Expenses</p><p className="font-black text-lg text-red-400">₹{expensesList.reduce((a:any,b:any)=>a+Number(b.amount||0),0).toLocaleString()}</p></div>
                          <div className="bg-blue-500/10 p-3 rounded-xl"><p className="opacity-50">Loan Interest Paid</p><p className="font-black text-lg text-blue-400">₹{loanPayments.reduce((a:any,b:any)=>a+Number(b.interest_part||0),0).toLocaleString()}</p></div>
                          <div className="bg-yellow-500/10 p-3 rounded-xl"><p className="opacity-50">Net Profit</p><p className="font-black text-lg text-yellow-400">₹{(cust.reduce((a:any,b:any)=>a+Number(b.total_amount||0),0) - expensesList.reduce((a:any,b:any)=>a+Number(b.amount||0),0) - loanPayments.reduce((a:any,b:any)=>a+Number(b.interest_part||0),0)).toLocaleString()}</p></div>
                        </div>
                        <div className="text-[10px] opacity-50">Formula: Net Profit = Sales + Service + Insurance Commission - Expenses - Loan Interest. COGS estimated 80% of payables for Hero bikes.</div>
                      </div>
                    )}

                    {financeSub === 'balancesheet' && (
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 space-y-3">
                        <p className="font-black text-sm">BALANCE SHEET (Assets = Liabilities + Capital)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-xl">
                            <p className="font-black text-green-400 mb-2">ASSETS (What you OWN)</p>
                            <p>Cash In Hand: ₹{bal.toLocaleString()}</p>
                            <p>Customer Due Receivable: ₹{due.toLocaleString()}</p>
                            <p>Vehicle Stock Value: ₹{veh.reduce((a:any,b:any)=>a+Number(b.price||0)*Number(b.stock||1),0).toLocaleString()}</p>
                            <p>Parts Stock Value: ₹{inv.reduce((a:any,b:any)=>a+Number(b.price||0)*Number(b.stock||b.qty||0),0).toLocaleString()}</p>
                            <p>Physical Assets: ₹{assetsList.reduce((a:any,b:any)=>a+Number(b.current_value||0),0).toLocaleString()}</p>
                            <p className="font-black mt-2 border-t border-white/10 pt-2">Total Assets: ₹{(bal + due + veh.reduce((a:any,b:any)=>a+Number(b.price||0)*Number(b.stock||1),0) + inv.reduce((a:any,b:any)=>a+Number(b.price||0)*Number(b.stock||b.qty||0),0) + assetsList.reduce((a:any,b:any)=>a+Number(b.current_value||0),0)).toLocaleString()}</p>
                          </div>
                          <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-xl">
                            <p className="font-black text-red-400 mb-2">LIABILITIES + CAPITAL (What you OWE + Invested)</p>
                            <p>Loans Outstanding: ₹{loansList.reduce((a:any,b:any)=>a+Number(b.outstanding_amount||0),0).toLocaleString()}</p>
                            <p>Vendor Payables Due: ₹{vendorPayables.reduce((a:any,b:any)=>a+Number(b.due_amount||0),0).toLocaleString()}</p>
                            <p>Capital (Invested - Withdrawn): ₹{(capitalList.filter((c:any)=>c.type==='capital_in').reduce((a:any,b:any)=>a+Number(b.amount||0),0) - capitalList.filter((c:any)=>c.type==='withdrawal').reduce((a:any,b:any)=>a+Number(b.amount||0),0)).toLocaleString()}</p>
                            <p>Retained Profit (Est): ₹{(cust.reduce((a:any,b:any)=>a+Number(b.total_amount||0),0) - expensesList.reduce((a:any,b:any)=>a+Number(b.amount||0),0)).toLocaleString()}</p>
                            <p className="font-black mt-2 border-t border-white/10 pt-2">Total Liabilities + Capital: ₹{(loansList.reduce((a:any,b:any)=>a+Number(b.outstanding_amount||0),0) + vendorPayables.reduce((a:any,b:any)=>a+Number(b.due_amount||0),0) + (capitalList.filter((c:any)=>c.type==='capital_in').reduce((a:any,b:any)=>a+Number(b.amount||0),0) - capitalList.filter((c:any)=>c.type==='withdrawal').reduce((a:any,b:any)=>a+Number(b.amount||0),0))).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {financeSub === 'cashflow' && (
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 space-y-2 text-xs">
                        <p className="font-black text-sm">CASHFLOW STATEMENT</p>
                        <div className="space-y-1">
                          <p className="font-black text-green-400">INFLOWS</p>
                          <p>Capital IN: ₹{capitalList.filter((c:any)=>c.type==='capital_in').reduce((a:any,b:any)=>a+Number(b.amount||0),0).toLocaleString()}</p>
                          <p>Loans Received: ₹{loansList.reduce((a:any,b:any)=>a+Number(b.principal_amount||0),0).toLocaleString()}</p>
                          <p>Customer Sales: ₹{cust.reduce((a:any,b:any)=>a+Number(b.total_amount||0),0).toLocaleString()}</p>
                          <p>Service Income: ₹{service.reduce((a:any,b:any)=>a+Number(b.amount||0),0).toLocaleString()}</p>
                          <p className="font-black mt-2">Total IN: ₹{(capitalList.filter((c:any)=>c.type==='capital_in').reduce((a:any,b:any)=>a+Number(b.amount||0),0) + loansList.reduce((a:any,b:any)=>a+Number(b.principal_amount||0),0) + cust.reduce((a:any,b:any)=>a+Number(b.total_amount||0),0) + service.reduce((a:any,b:any)=>a+Number(b.amount||0),0)).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1 mt-3 border-t border-white/10 pt-3">
                          <p className="font-black text-red-400">OUTFLOWS</p>
                          <p>Capital Withdrawal: ₹{capitalList.filter((c:any)=>c.type==='withdrawal').reduce((a:any,b:any)=>a+Number(b.amount||0),0).toLocaleString()}</p>
                          <p>Loan Repayments: ₹{loanPayments.reduce((a:any,b:any)=>a+Number(b.amount||0),0).toLocaleString()}</p>
                          <p>Vendor Payables Paid: ₹{vendorPayables.reduce((a:any,b:any)=>a+Number(b.paid_amount||0),0).toLocaleString()}</p>
                          <p>Expenses: ₹{expensesList.reduce((a:any,b:any)=>a+Number(b.amount||0),0).toLocaleString()}</p>
                          <p>Assets Purchased: ₹{assetsList.reduce((a:any,b:any)=>a+Number(b.purchase_cost||0),0).toLocaleString()}</p>
                          <p className="font-black mt-2">Total OUT: ₹{(capitalList.filter((c:any)=>c.type==='withdrawal').reduce((a:any,b:any)=>a+Number(b.amount||0),0) + loanPayments.reduce((a:any,b:any)=>a+Number(b.amount||0),0) + vendorPayables.reduce((a:any,b:any)=>a+Number(b.paid_amount||0),0) + expensesList.reduce((a:any,b:any)=>a+Number(b.amount||0),0) + assetsList.reduce((a:any,b:any)=>a+Number(b.purchase_cost||0),0)).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-xl mt-3">
                          <p className="font-black">Net Cashflow = IN - OUT = ₹{((capitalList.filter((c:any)=>c.type==='capital_in').reduce((a:any,b:any)=>a+Number(b.amount||0),0) + loansList.reduce((a:any,b:any)=>a+Number(b.principal_amount||0),0) + cust.reduce((a:any,b:any)=>a+Number(b.total_amount||0),0)) - (capitalList.filter((c:any)=>c.type==='withdrawal').reduce((a:any,b:any)=>a+Number(b.amount||0),0) + loanPayments.reduce((a:any,b:any)=>a+Number(b.amount||0),0) + vendorPayables.reduce((a:any,b:any)=>a+Number(b.paid_amount||0),0) + expensesList.reduce((a:any,b:any)=>a+Number(b.amount||0),0))).toLocaleString()}</p>
                          <p className="opacity-50 text-[10px]">Should match Cash In Hand ₹{bal.toLocaleString()}</p>
                        </div>
                      </div>
                    )}

                    {financeSub === 'journal' && (
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3">
                        <p className="font-black text-xs mb-2">Full Journal ({financeJournal.length})</p>
                        <div className="space-y-1 max-h-[60vh] overflow-auto text-xs">
                          {financeJournal.map((j:any)=>(
                            <div key={j.id} className="py-2 px-3 rounded-xl bg-white/[0.04] flex justify-between"><div><span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${j.type === 'sale' ? 'bg-green-500/20 text-green-400' : 'bg-white/10'}`}>{j.type.toUpperCase()}</span> {j.reason} - {j.category}</div><span className="font-black">₹{Number(j.amount).toLocaleString()}</span></div>
                          ))}
                          {capitalList.map((c:any)=>(
                            <div key={'cap-'+c.id} className="py-2 px-3 rounded-xl bg-green-500/5 flex justify-between text-xs"><span>CAPITAL {c.type.toUpperCase()} - {c.source}</span><span className="font-black text-green-400">₹{Number(c.amount).toLocaleString()}</span></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {tab === 'settings' && (
              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-red-500/30 bg-red-500/10 p-5">
                  <h3 className="font-black text-red-400 tracking-[0.2em]">SETTINGS - DANGER ZONE</h3>
                  <p className="text-xs opacity-60 mt-1">Delete and Due Reset - Admin Only. Unlock first.</p>
                  {!settingsUnlocked ? (
                    <div className="mt-4 flex gap-2">
                      <input value={settingsPass} onChange={(e)=>setSettingsPass(e.target.value)} type="password" placeholder="Admin Password" className="flex-1 bg-black/50 border border-red-500/30 p-3 rounded-xl text-xs outline-none" onKeyDown={(e)=> e.key === 'Enter' && unlockSettings()} />
                      <button onClick={unlockSettings} className="bg-red-600 text-white px-6 rounded-xl font-black text-xs">UNLOCK</button>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-2 items-center">
                      <div className="flex-1 bg-green-500/20 border border-green-500/30 p-3 rounded-xl text-xs font-black text-green-400">UNLOCKED - Delete and Due Reset enabled</div>
                      <button onClick={lockSettings} className="bg-white/10 px-6 py-3 rounded-xl font-black text-xs">LOCK AGAIN</button>
                    </div>
                  )}
                </div>

                <div className="rounded-[1.5rem] border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-300 mb-3">DUE RESET - Fix that ₹{due.toLocaleString()} due</p>
                  <div className="space-y-3">
                    <div className="rounded-xl bg-black/40 p-3 border border-white/10">
                      <p className="text-xs font-black mb-2">Reset Single Customer Due (search by phone/name)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input value={dueResetPhone} onChange={(e)=>setDueResetPhone(e.target.value)} placeholder="Phone or Name" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                        <input value={dueResetAmount} onChange={(e)=>setDueResetAmount(e.target.value)} type="number" placeholder="New Due 0 = Paid" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                        <button disabled={!settingsUnlocked} onClick={resetSingleDue} className={`p-3 rounded-xl text-xs font-black ${settingsUnlocked ? 'bg-yellow-500 text-black' : 'bg-white/5 text-white/20'}`}>RESET DUE</button>
                      </div>
                      {dueResetPhone && <p className="text-[10px] opacity-50 mt-2">Matched {cust.filter((c:any)=> (c.phone && c.phone.toLowerCase().includes(dueResetPhone.toLowerCase())) || (c.customer_name && c.customer_name.toLowerCase().includes(dueResetPhone.toLowerCase()))).length} customer(s) | Total Due Rs {cust.reduce((a:any,b:any)=>a+Number(b.due_amount||0),0).toLocaleString()}</p>}
                    </div>
                    <div className="rounded-xl bg-red-500/10 p-3 border border-red-500/20 flex justify-between items-center">
                      <div><p className="text-xs font-black text-red-300">Reset ALL Dues to 0</p><p className="text-[10px] opacity-50">Total Due Now Rs {cust.reduce((a:any,b:any)=>a+Number(b.due_amount||0),0).toLocaleString()} from {cust.filter((c:any)=>Number(c.due_amount||0)>0).length} customers</p></div>
                      <button disabled={!settingsUnlocked} onClick={resetAllDues} className={`px-6 py-3 rounded-xl text-xs font-black ${settingsUnlocked ? 'bg-red-600 text-white' : 'bg-white/5 text-white/20'}`}>RESET ALL TO 0</button>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] p-3 border border-white/10 max-h-40 overflow-auto">
                      <p className="text-[10px] uppercase mb-2 opacity-50">Customers with Due (your ₹{due.toLocaleString()} comes from here)</p>
                      {cust.filter((c:any)=>Number(c.due_amount||0)>0).map((c:any)=>(
                        <div key={c.id} className="py-1 flex justify-between text-xs"><span>{c.customer_name||c.name} | {c.phone}</span><span className="font-black text-red-400">Rs {Number(c.due_amount||0).toLocaleString()}</span></div>
                      ))}
                      {cust.filter((c:any)=>Number(c.due_amount||0)>0).length === 0 && <p className="text-[10px] opacity-30">No dues!</p>}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-red-300 mb-3">Delete ALL - Bulk Delete (Requires Unlock)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <button disabled={!settingsUnlocked} onClick={()=>requestDeleteAll('trans')} className={`p-3 rounded-xl text-xs font-black text-left flex justify-between ${settingsUnlocked ? 'bg-red-600 text-white' : 'bg-white/5 text-white/20'}`}><span>Transactions - {list.length}</span><span>DELETE ALL</span></button>
                    <button disabled={!settingsUnlocked} onClick={()=>requestDeleteAll('inv')} className={`p-3 rounded-xl text-xs font-black text-left flex justify-between ${settingsUnlocked ? 'bg-red-600 text-white' : 'bg-white/5 text-white/20'}`}><span>Parts - {inv.length}</span><span>DELETE ALL</span></button>
                    <button disabled={!settingsUnlocked} onClick={()=>requestDeleteAll('veh')} className={`p-3 rounded-xl text-xs font-black text-left flex justify-between ${settingsUnlocked ? 'bg-red-600 text-white' : 'bg-white/5 text-white/20'}`}><span>Vehicles - {veh.length}</span><span>DELETE ALL</span></button>
                    <button disabled={!settingsUnlocked} onClick={()=>requestDeleteAll('cust')} className={`p-3 rounded-xl text-xs font-black text-left flex justify-between ${settingsUnlocked ? 'bg-red-600 text-white' : 'bg-white/5 text-white/20'}`}><span>Customers - {cust.length}</span><span>DELETE ALL</span></button>
                    <button disabled={!settingsUnlocked} onClick={()=>requestDeleteAll('staff')} className={`p-3 rounded-xl text-xs font-black text-left flex justify-between ${settingsUnlocked ? 'bg-red-600 text-white' : 'bg-white/5 text-white/20'}`}><span>Staff - {staff.length}</span><span>DELETE ALL</span></button>
                    <button disabled={!settingsUnlocked} onClick={()=>requestDeleteAll('service')} className={`p-3 rounded-xl text-xs font-black text-left flex justify-between ${settingsUnlocked ? 'bg-red-600 text-white' : 'bg-white/5 text-white/20'}`}><span>Service - {service.length}</span><span>DELETE ALL</span></button>
                    <button disabled={!settingsUnlocked} onClick={()=>requestDeleteAll('ins')} className={`p-3 rounded-xl text-xs font-black text-left flex justify-between ${settingsUnlocked ? 'bg-red-600 text-white' : 'bg-white/5 text-white/20'}`}><span>Insurance - {insure.length}</span><span>DELETE ALL</span></button>
                    <button disabled={!settingsUnlocked} onClick={()=>requestDeleteAll('cash_ledger')} className={`p-3 rounded-xl text-xs font-black text-left flex justify-between ${settingsUnlocked ? 'bg-red-600 text-white' : 'bg-white/5 text-white/20'}`}><span>Cash Ledger - {cashList.length}</span><span>DELETE ALL</span></button>
                    <button disabled={!settingsUnlocked} onClick={()=>requestDeleteAll('finance_journal')} className={`p-3 rounded-xl text-xs font-black text-left flex justify-between ${settingsUnlocked ? 'bg-red-600 text-white' : 'bg-white/5 text-white/20'}`}><span>Finance Journal - {financeJournal.length}</span><span>DELETE ALL</span></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
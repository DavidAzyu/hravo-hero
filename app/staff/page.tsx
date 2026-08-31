'use client';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Html5Qrcode } from 'html5-qrcode';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xojpmzxnvjojenicmvib.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvanBtenhudmpvamVuaWNtdmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODg2NTAsImV4cCI6MjEwMzU2NDY1MH0.CzckS-2IoSVSburZLfhbBOJEOz4LiXIgqbdwyCm_R-0';
// SINGLETON SUPABASE - avoids "GoTrueClient multiple instances" warnings
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const getSupabase = () => supabase;

export default function StaffPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [staff, setStaff] = useState<any>(null);
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState('scan');
  const [cat, setCat] = useState('bike');
  const [vCat, setVCat] = useState('bike');
  const [inv, setInv] = useState<any[]>([]);
  const [veh, setVeh] = useState<any[]>([]);
  const [cust, setCust] = useState<any[]>([]);
  const [service, setService] = useState<any[]>([]);
  const [insure, setInsure] = useState<any[]>([]);
  const [trans, setTrans] = useState<any[]>([]);
  const [qr, setQr] = useState('');
  const [mode, setMode] = useState('service');
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = 'qr-reader-staff';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('150');
  const [pQty, setPQty] = useState('1');
  const [outId, setOutId] = useState('');
  const [outQty, setOutQty] = useState('1');
  const [outReason, setOutReason] = useState('');
  const [vModel, setVModel] = useState('');
  const [vChassis, setVChassis] = useState('');
  const [vEngine, setVEngine] = useState('');
  const [vColor, setVColor] = useState('Black');
  const [vPrice, setVPrice] = useState('');
  const [vQty, setVQty] = useState('1');
  const [dAmt, setDAmt] = useState('');
  const [dMode, setDMode] = useState('Cash');
  const [dReason, setDReason] = useState('');
  const [dCust, setDCust] = useState('');
  const [completePrice, setCompletePrice] = useState('500');
  const [completingService, setCompletingService] = useState<any>(null);
  const [showPartConfirm, setShowPartConfirm] = useState(false);
  const [pendingPart, setPendingPart] = useState<any>(null);
  const [ocrText, setOcrText] = useState('');
  const [scanStatus, setScanStatus] = useState('Ready');

  // Role-based feature visibility
  const isManager = staff?.role === 'Manager';
  const isAccountant = staff?.role === 'Accountant';
  const isMechanic = staff?.role === 'Mechanic';
  const isSales = staff?.role === 'Sales';
  
  const canViewStock = isManager || isAccountant || isSales || isMechanic;
  const canViewParts = isManager || isAccountant || isMechanic;
  const canAddVehicle = isManager || isAccountant || isSales;
  const canAddParts = isManager || isAccountant || isMechanic;
  const canSellParts = isManager || isSales || isMechanic;
  const canAddDawn = isManager || isAccountant || isSales;
  const canCompleteService = isManager || isMechanic;
  const canViewService = isManager || isMechanic || isSales || isAccountant;
  const canViewMyTransactions = true;
  const canViewAllTransactions = isManager || isAccountant;

  const load = async () => {
    const sup = getSupabase();
    const a = await sup.from('inventory').select('*').order('created_at', { ascending: false });
    if (a.data) setInv(a.data);
    const b = await sup.from('vehicle_inventory').select('*').order('created_at', { ascending: false });
    if (b.data) setVeh(b.data);
    const c = await sup.from('customer_profiles').select('*').order('created_at', { ascending: false });
    if (c.data) setCust(c.data);
    const d = await sup.from('service_bookings').select('*').order('created_at', { ascending: false });
    if (d.data) setService(d.data);
    const e = await sup.from('insurance').select('*').order('created_at', { ascending: false });
    if (e.data) setInsure(e.data);
    const f = await sup.from('transactions').select('*').order('created_at', { ascending: false }).limit(200);
    if (f.data) setTrans(f.data);
  };

  useEffect(() => {
    if (logged) load();
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {}).finally(() => html5QrCodeRef.current?.clear());
      }
    };
  }, [logged]);

  const login = async () => {
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();
    if (!trimmedPhone) {
      alert('Phone number enter rawh');
      return;
    }
    const sup = getSupabase();
    try {
      const { data, error } = await sup
        .from('staff_profiles')
        .select('*')
        .eq('phone', trimmedPhone)
        .maybeSingle();

      if (error) {
        alert('Supabase error: ' + error.message);
        console.error('Staff login error:', error);
        return;
      }

      if (!data) {
        alert('Staff hmuh loh - Phone: ' + trimmedPhone + ' check rawh');
        return;
      }

      const savedPassword = typeof data.password === 'string' ? data.password.trim() : '';
      if (savedPassword) {
        if (!trimmedPassword) {
          alert('Password dah rawh');
          return;
        }
        if (savedPassword !== trimmedPassword) {
          alert('Password dik lo!');
          return;
        }
      }

      setStaff(data);
      setLogged(true);
      setTab('scan');
      setPassword('');
    } catch (err: any) {
      alert('Unexpected error: ' + (err?.message || 'Unknown'));
      console.error('Staff login exception:', err);
    }
  };

  const parseHondaQR = (val: string) => {
    const upper = val.toUpperCase();
    let name = '';
    let price = '';
    let qty = '1';
    if (upper.includes('SEAL OIL')) name = 'SEAL OIL';
    else if (upper.includes('AIR FILTER')) name = 'AIR FILTER';
    else if (upper.includes('BRAKE SHOE')) name = 'BRAKE SHOE';
    else if (upper.includes('SPARK PLUG')) name = 'SPARK PLUG';
    else {
      const nameMatch = val.match(/([A-Z ]{3,})\s*B\. NO/i) || val.match(/^\S+\s+([A-Z ]+OIL)/i);
      if (nameMatch) name = nameMatch[1].trim();
    }
    const mrpMatch = val.match(/MRP.*?₹?\s*([\d,]+\.?\d*)/i) || val.match(/₹\s*([\d,]+\.?\d*)/i) || val.match(/MRP\s*(\d+)/i);
    if (mrpMatch) price = mrpMatch[1].replace(/,/g, '');
    const qtyMatch = val.match(/QUANTITY:\s*(\d+)/i) || val.match(/QTY\s*(\d+)/i);
    if (qtyMatch) qty = qtyMatch[1];
    const codeMatch = val.match(/(9\d{4}[A-Z0-9]+)/);
    return { name: name || (codeMatch ? codeMatch[1] : val.slice(0, 20)), price: price || '150', qty, code: codeMatch?.[1] || val.slice(0, 14) };
  };

  const applyParsedPart = (raw: string) => {
    if (!canAddParts) {
      alert('Nangmah parts add thei lo - Manager or Accountant or Mechanic chauh');
      return;
    }
    const parsed = parseHondaQR(raw);
    setQr(raw);
    setPendingPart(parsed);
    setPName(parsed.name);
    setPPrice(parsed.price);
    setPQty(parsed.qty);
    setShowPartConfirm(true);
    setScanStatus(`Part recognized: ${parsed.name}`);
  };

  const handleQr = async (code: string) => {
    if (!code) return;
    setQr(code);
    const sup = getSupabase();
    if (mode === 'service') {
      if (!canCompleteService && !canViewService) {
        alert('Service hmu thei lo - role check');
        return;
      }
      const s = service.find((x: any) => x.qr_code === code || code.includes(x.qr_code) || x.qr_code.includes(code));
      if (s) {
        if (s.status === 'completed') {
          alert('Already Completed - ' + s.customer_name);
          return;
        }
        setCompletingService(s);
        setCompletePrice(String(s.amount && s.amount > 0 ? s.amount : 500));
        setScanStatus(`Service matched: ${s.customer_name}`);
        stopCam();
        return;
      }

      const { data } = await sup.from('service_bookings').select('*').eq('qr_code', code).maybeSingle();
      if (data) {
        setCompletingService(data);
        setCompletePrice(String(data.amount && data.amount > 0 ? data.amount : 500));
        setScanStatus(`Service matched: ${data.customer_name}`);
        stopCam();
        return;
      }
      alert('Service hmuh loh - QR: ' + code);
      setScanStatus('Service not found');
    } else if (mode === 'vehicle') {
      if (!canAddVehicle) {
        alert('Vehicle add thei lo - Manager or Accountant or Sales chauh');
        return;
      }
      setVChassis(code);
      setScanStatus(`Vehicle code captured: ${code}`);
      stopCam();
      setTab('stock');
    } else {
      applyParsedPart(code);
      stopCam();
    }
  };

  const performManualOcr = () => {
    const clean = ocrText.trim();
    if (!clean) return;
    applyParsedPart(clean);
    setOcrText('');
  };

  const startCam = async (m: string) => {
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
        const qrBoxSize = Math.min(window.innerWidth - 60, 260);
        const html5QrCode = new Html5Qrcode(qrRegionId);
        html5QrCodeRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: qrBoxSize, height: Math.max(180, qrBoxSize - 30) }, aspectRatio: 1.0 },
          (decodedText) => handleQr(decodedText),
          () => {}
        );
        setScanStatus('Camera live');
      } catch {
        setScanning(false);
        setScanStatus('Camera unavailable');
        alert('Camera phal lo - HTTPS ah lut rawh');
      }
    }, 250);
  };

  const stopCam = async () => {
    setScanning(false);
    if (html5QrCodeRef.current) {
      try { await html5QrCodeRef.current.stop(); } catch {}
      try { await html5QrCodeRef.current.clear(); } catch {}
      html5QrCodeRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t: any) => t.stop());
    }
  };

  const confirmCompleteWithPrice = async () => {
    if (!completingService) return;
    if (!canCompleteService) {
      alert('Service complete thei lo - Manager or Mechanic chauh');
      return;
    }
    const sup = getSupabase();
    await sup.from('service_bookings').update({ status: 'completed', amount: Number(completePrice || 0) }).eq('id', completingService.id);
    await sup.from('transactions').insert([
      {
        type: 'lut',
        amount: Number(completePrice || 0),
        reason: completingService.customer_name + ' - ' + completingService.service_type + ' - Rs ' + completePrice + ' - ' + dMode + ' - BY ' + staff.staff_name,
      },
    ]);
    setCompletingService(null);
    setCompletePrice('500');
    stopCam();
    load();
    setTab('service');
    alert('COMPLETED - Rs ' + completePrice + ' - ' + completingService.customer_name);
  };

  const addDawn = async () => {
    if (!canAddDawn) {
      alert('Dawn add thei lo - Manager or Accountant or Sales chauh');
      return;
    }
    if (!dAmt || !dReason) {
      alert('Amount leh Reason hi fill rawh');
      return;
    }
    const sup = getSupabase();
    await sup.from('transactions').insert([{ type: 'lut', amount: Number(dAmt), reason: (dCust ? dCust + ' - ' : '') + dReason + ' - ' + dMode + ' - BY ' + staff.staff_name }]);
    load();
    setDAmt('');
    setDReason('');
    setDCust('');
    setTab('dawn');
    alert('Dawn added!');
  };

  const addVeh = async () => {
    if (!canAddVehicle) {
      alert('Vehicle add thei lo - Manager or Accountant or Sales chauh');
      return;
    }
    if (!vModel || !vChassis) {
      alert('Model leh Chassis hi fill rawh');
      return;
    }
    const sup = getSupabase();
    const existing = veh.find((item: any) => item.chassis_no && item.chassis_no.toLowerCase() === (vChassis || '').toLowerCase());
    if (existing) {
      await sup.from('vehicle_inventory').update({ stock: existing.stock + Number(vQty || 1), price: Number(vPrice || existing.price) }).eq('id', existing.id);
    } else {
      await sup.from('vehicle_inventory').insert([
        { vehicle_type: vCat, model_name: vModel, chassis_no: vChassis, engine_no: vEngine, color: vColor, stock: Number(vQty || 1), price: Number(vPrice || 0) },
      ]);
    }
    setVModel(''); setVChassis(''); setVEngine(''); setVPrice(''); setVQty('1');
    load();
    alert('Vehicle added!');
  };

  const addPart = async () => {
    if (!canAddParts) {
      alert('Parts add thei lo - Manager or Accountant or Mechanic chauh');
      return;
    }
    if (!pName) return;
    const sup = getSupabase();
    const fullName = pendingPart?.code ? `${pendingPart.code} - ${pName}` : pName;
    const existing = inv.find((x: any) => x.category === cat && x.name.toLowerCase() === fullName.toLowerCase());
    if (existing) {
      await sup.from('inventory').update({ stock: existing.stock + Number(pQty || 1), price: Number(pPrice || existing.price), name: fullName }).eq('id', existing.id);
    } else {
      try {
        await sup.from('inventory').insert([{ name: fullName, part_no: pendingPart?.code || '', category: cat, stock: Number(pQty), price: Number(pPrice || 0) }]);
      } catch {
        await sup.from('inventory').insert([{ name: fullName, category: cat, stock: Number(pQty), price: Number(pPrice || 0) }]);
      }
    }
    setShowPartConfirm(false);
    setPendingPart(null);
    setPName('');
    setPPrice('150');
    setPQty('1');
    load();
    setTab('parts');
    alert('Part added!');
  };

  const outPart = async () => {
    if (!canSellParts) {
      alert('Parts sell thei lo - Manager or Sales or Mechanic chauh');
      return;
    }
    const sup = getSupabase();
    const p = inv.find((x: any) => x.id === outId);
    if (!p) return alert('Part select rawh');
    const qty = Number(outQty || 1);
    await sup.from('inventory').update({ stock: Math.max(0, p.stock - qty) }).eq('id', p.id);
    await sup.from('transactions').insert([{ type: 'lut', amount: Number(p.price) * qty, reason: (outReason || 'PARTS SALE') + ' - ' + p.name + ' - ' + dMode + ' - BY ' + staff.staff_name }]);
    setOutId(''); setOutQty('1'); setOutReason('');
    load();
    setTab('dawn');
    alert('Part sold!');
  };

  if (!logged) {
    return (
      <div className="min-h-screen bg-[#05070b] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="bg-red-600 inline-block px-4 py-2 rounded-xl font-black text-sm tracking-[0.3em]">HRAVO</div>
            <h1 className="font-black text-2xl mt-3 tracking-[0.3em]">STAFF</h1>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-6 shadow-[0_0_35px_rgba(239,68,68,0.08)] backdrop-blur-xl">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full bg-black/50 border border-white/20 p-4 rounded-xl text-sm outline-none focus:border-red-500" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full mt-3 bg-black/50 border border-white/20 p-4 rounded-xl text-sm outline-none focus:border-red-500" onKeyDown={(e) => e.key === 'Enter' && login()} />
            <button onClick={login} className="w-full mt-3 bg-white text-black py-4 rounded-xl font-black text-sm">LOGIN</button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'scan', label: 'Scan', icon: '◌', visible: true },
    { id: 'stock', label: 'Stock', icon: '△', visible: canViewStock },
    { id: 'parts', label: 'Parts', icon: '▣', visible: canViewParts },
    { id: 'dawn', label: 'Dawn', icon: '◫', visible: canAddDawn },
    { id: 'service', label: 'Service', icon: '✦', visible: canViewService },
    { id: 'transactions', label: 'My Work', icon: '◈', visible: canViewMyTransactions },
  ].filter(item => item.visible);

  const myTrans = trans.filter((t: any) => t.reason?.includes(staff.staff_name));
  const allTrans = canViewAllTransactions ? trans : myTrans;
  const myTotal = myTrans.reduce((a: any, b: any) => a + Number(b.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(250,204,21,0.12),_transparent_22%)]" />

      {completingService && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#1a1a1a] border border-yellow-500/30 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-black text-yellow-400 mb-2">SERVICE COMPLETE - PRICE ENTRY</h3>
            <p className="text-xs opacity-60 mb-1">{completingService.customer_name} - {completingService.model_name}</p>
            <p className="text-xs font-mono opacity-40 mb-1">{completingService.qr_code} | {completingService.service_type}</p>
            <p className="text-xs opacity-30 mb-3">Customer ah price lang lo - hetah fix rawh</p>
            <input value={completePrice} onChange={(e) => setCompletePrice(e.target.value)} type="number" placeholder="Price Rs" className="w-full bg-black border border-yellow-500/30 p-4 rounded-xl text-sm mb-2 outline-none" autoFocus />
            <select value={dMode} onChange={(e) => setDMode(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs mb-3">
              <option>Cash</option>
              <option>GPay</option>
              <option>PhonePe</option>
              <option>UPI</option>
            </select>
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
              <div><p className="opacity-50">NAME</p><input value={pName} onChange={(e) => setPName(e.target.value)} className="w-full bg-black border border-white/20 p-3 rounded-xl text-sm" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><p className="opacity-50">PRICE (MRP)</p><input value={pPrice} onChange={(e) => setPPrice(e.target.value)} type="number" className="w-full bg-black border border-white/20 p-3 rounded-xl text-sm" /></div>
                <div><p className="opacity-50">QTY</p><input value={pQty} onChange={(e) => setPQty(e.target.value)} type="number" className="w-full bg-black border border-white/20 p-3 rounded-xl text-sm" /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setShowPartConfirm(false); setPendingPart(null); }} className="bg-white/10 py-3 rounded-xl font-black text-xs">CANCEL</button>
              <button onClick={addPart} className="bg-green-500 text-black py-3 rounded-xl font-black text-xs">CONFIRM + ADD</button>
            </div>
          </div>
        </div>
      )}

      {outId && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#1a1a1a] border border-green-500/30 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-black text-green-400 mb-2">SELL PART</h3>
            <p className="text-xs opacity-60 mb-3">{inv.find((x: any) => x.id === outId)?.name}</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input value={outQty} onChange={(e) => setOutQty(e.target.value)} type="number" placeholder="Qty" className="bg-black border border-white/20 p-3 rounded-xl text-sm" />
              <select value={dMode} onChange={(e) => setDMode(e.target.value)} className="bg-black border border-white/20 p-3 rounded-xl text-sm">
                <option>Cash</option>
                <option>GPay</option>
                <option>PhonePe</option>
                <option>UPI</option>
              </select>
            </div>
            <input value={outReason} onChange={(e) => setOutReason(e.target.value)} placeholder="Reason" className="w-full bg-black border border-white/20 p-3 rounded-xl text-sm mb-3" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setOutId('')} className="bg-white/10 py-3 rounded-xl font-black text-xs">CANCEL</button>
              <button onClick={outPart} className="bg-green-500 text-black py-3 rounded-xl font-black text-xs">CONFIRM</button>
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
              <h1 className="mt-1 text-lg font-black tracking-[0.2em]">STAFF</h1>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${
                  tab === item.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">Staff</p>
              <p className="mt-3 text-lg font-black">{staff?.staff_name}</p>
              <p className="mt-1 text-xs text-slate-300">{staff?.role}</p>
            </div>
            {canViewMyTransactions && (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">My Total</p>
                <p className="mt-3 text-2xl font-black text-emerald-300">₹{myTotal.toLocaleString()}</p>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-sm font-black lg:hidden">H</div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.34em] text-red-400">Workspace</p>
                  <h2 className="mt-1 text-xl font-black tracking-[0.12em]">STAFF</h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 md:block">{staff?.staff_name} - {staff?.role}</div>
                <button onClick={() => { setLogged(false); setStaff(null); }} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/10">Logout</button>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6">
            <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${tab === item.id ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-300'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-5 pb-10">
              {tab === 'scan' && (
                <div className="rounded-[1.75rem] border border-cyan-500/20 bg-slate-950/80 overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.08)]">
                  <div className="relative h-[300px] sm:h-[340px] bg-black">
                    <div id={qrRegionId} className="w-full h-full"></div>
                    {!scanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">📷</div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">QR scanner ready</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-900/80">
                    <button onClick={() => startCam('service')} className={`py-3 rounded-xl font-black text-xs ${mode === 'service' && scanning ? 'bg-yellow-400 text-black' : 'bg-white/10'}`}>SERVICE</button>
                    <button onClick={() => startCam('vehicle')} className={`py-3 rounded-xl font-black text-xs ${mode === 'vehicle' && scanning ? 'bg-red-600 text-white' : 'bg-white/10'}`}>VEHICLE</button>
                    <button onClick={() => startCam('in')} className={`py-3 rounded-xl font-black text-xs ${mode === 'in' && scanning ? 'bg-green-500 text-black' : 'bg-white/10'}`}>PARTS</button>
                  </div>
                  {scanning ? (
                    <button onClick={stopCam} className="w-full bg-white text-black py-3 font-black text-xs">STOP CAMERA</button>
                  ) : (
                    <button onClick={() => startCam(mode)} className="w-full bg-cyan-500 text-black py-3 font-black text-xs">START CAMERA - {mode.toUpperCase()}</button>
                  )}
                  <div className="p-3 space-y-2 border-t border-white/5 bg-black/20">
                    <div className="flex gap-2">
                      <input value={qr} onChange={(e) => setQr(e.target.value)} placeholder="QR Manual" className="flex-1 bg-zinc-900 border border-white/10 p-3 rounded-xl text-xs font-mono" />
                      <button onClick={() => handleQr(qr)} className="bg-white text-black px-5 rounded-xl font-black text-xs">USE</button>
                    </div>
                    <div className="flex gap-2">
                      <input value={ocrText} onChange={(e) => setOcrText(e.target.value)} placeholder="OCR / part text" className="flex-1 bg-zinc-900 border border-white/10 p-3 rounded-xl text-xs font-mono" />
                      <button onClick={performManualOcr} className="bg-emerald-500 text-black px-5 rounded-xl font-black text-xs">OCR</button>
                    </div>
                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-cyan-300">Status: {scanStatus}</div>
                  </div>
                </div>
              )}

              {tab === 'stock' && canViewStock && (
                <div className="grid gap-4 lg:grid-cols-2">
                  {canAddVehicle && (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                      <div className="flex gap-2 mb-3">
                        <button onClick={() => setVCat('bike')} className={`flex-1 py-2 rounded-full text-xs font-black ${vCat === 'bike' ? 'bg-white text-black' : 'bg-white/5'}`}>BIKE</button>
                        <button onClick={() => setVCat('scooty')} className={`flex-1 py-2 rounded-full text-xs font-black ${vCat === 'scooty' ? 'bg-white text-black' : 'bg-white/5'}`}>SCOOTY</button>
                      </div>
                      <div className="space-y-2">
                        <input value={vModel} onChange={(e) => setVModel(e.target.value)} placeholder="Model *" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                        <div className="grid grid-cols-2 gap-2">
                          <input value={vChassis} onChange={(e) => setVChassis(e.target.value)} placeholder="Chassis" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                          <input value={vEngine} onChange={(e) => setVEngine(e.target.value)} placeholder="Engine" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select value={vColor} onChange={(e) => setVColor(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>Black</option><option>Red</option><option>Blue</option><option>Grey</option><option>White</option></select>
                          <input value={vPrice} onChange={(e) => setVPrice(e.target.value)} type="number" placeholder="Price" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                        </div>
                        <input value={vQty} onChange={(e) => setVQty(e.target.value)} type="number" placeholder="Qty" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                        <button onClick={addVeh} className="w-full bg-white text-black py-3 rounded-xl font-black text-xs">+ ADD</button>
                      </div>
                    </div>
                  )}

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] divide-y divide-white/5 max-h-[420px] overflow-auto">
                    <div className="p-3 flex gap-2">
                      <button onClick={() => setVCat('bike')} className={`flex-1 py-2 rounded-full text-xs font-black ${vCat === 'bike' ? 'bg-white text-black' : 'bg-white/5'}`}>BIKE</button>
                      <button onClick={() => setVCat('scooty')} className={`flex-1 py-2 rounded-full text-xs font-black ${vCat === 'scooty' ? 'bg-white text-black' : 'bg-white/5'}`}>SCOOTY</button>
                    </div>
                    {veh.filter((v: any) => v.vehicle_type === vCat).map((v: any) => (
                      <div key={v.id} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-black text-xs">{v.model_name} - {v.color}</p>
                          <p className="text-xs opacity-40">{v.chassis_no} | {v.engine_no}</p>
                          <p className="text-xs text-emerald-300">Stock: {v.stock} | ₹{v.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'parts' && canViewParts && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button onClick={() => setCat('bike')} className={`flex-1 py-2 rounded-full text-xs font-black ${cat === 'bike' ? 'bg-white text-black' : 'bg-white/5'}`}>BIKE</button>
                    <button onClick={() => setCat('scooty')} className={`flex-1 py-2 rounded-full text-xs font-black ${cat === 'scooty' ? 'bg-white text-black' : 'bg-white/5'}`}>SCOOTY</button>
                    <button onClick={() => setCat('parts')} className={`flex-1 py-2 rounded-full text-xs font-black ${cat === 'parts' ? 'bg-white text-black' : 'bg-white/5'}`}>PARTS</button>
                  </div>

                  {canAddParts && (
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Part Name" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                        <input value={pPrice} onChange={(e) => setPPrice(e.target.value)} type="number" placeholder="MRP" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                        <input value={pQty} onChange={(e) => setPQty(e.target.value)} type="number" placeholder="Qty" className="col-span-2 bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                        <button onClick={addPart} className="col-span-2 bg-green-500 text-black py-3 rounded-xl font-black text-xs">+ ADD PART</button>
                      </div>
                    </div>
                  )}

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] divide-y divide-white/5 max-h-[420px] overflow-auto">
                    {inv.filter((x: any) => x.category === cat).map((v: any) => (
                      <div key={v.id} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-black text-xs">{v.name}</p>
                          <p className="text-xs opacity-40">Stock: {v.stock} | Rs {v.price}</p>
                        </div>
                        {canSellParts && (
                          <button onClick={() => setOutId(v.id)} className="bg-white text-black px-3 py-1 rounded-full text-xs font-black">SELL</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'dawn' && canAddDawn && (
                <div className="space-y-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                    <div className="space-y-2">
                      <input value={dCust} onChange={(e) => setDCust(e.target.value)} placeholder="Customer Name" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <input value={dAmt} onChange={(e) => setDAmt(e.target.value)} type="number" placeholder="Amount" className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      <div className="grid grid-cols-2 gap-2">
                        <select value={dMode} onChange={(e) => setDMode(e.target.value)} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs"><option>Cash</option><option>GPay</option><option>PhonePe</option><option>UPI</option></select>
                        <input value={dReason} onChange={(e) => setDReason(e.target.value)} placeholder="Reason" className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs" />
                      </div>
                      <button onClick={addDawn} className="w-full bg-green-500 text-black py-3 rounded-xl font-black text-xs">+ DAWN</button>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] divide-y divide-white/5 max-h-[420px] overflow-auto">
                    {myTrans.map((t: any) => (
                      <div key={t.id} className="p-3">
                        <p className="font-black text-xs">₹{t.amount} - {t.reason}</p>
                        <p className="text-xs opacity-40">{new Date(t.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'service' && canViewService && (
                <div className="space-y-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] divide-y divide-white/5 max-h-[420px] overflow-auto">
                    {service.map((item: any) => (
                      <div key={item.id} className="p-3">
                        <p className="font-black text-xs">{item.customer_name} | {item.model_name}</p>
                        <p className="text-xs opacity-40">{item.service_type} | {item.status} | ₹{item.amount || 'Pending'}</p>
                        {item.status !== 'completed' && canCompleteService && (
                          <button onClick={() => setCompletingService(item)} className="mt-2 bg-green-500 text-black px-3 py-1 rounded-full text-[10px] font-black">COMPLETE</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'transactions' && canViewMyTransactions && (
                <div className="space-y-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                    <p className="font-black text-xs mb-3">MY WORK - ₹{myTotal.toLocaleString()}</p>
                    <p className="text-[10px] opacity-40 mb-3">Transactions with your name</p>
                    <div className="divide-y divide-white/5 max-h-[420px] overflow-auto">
                      {myTrans.map((t: any) => (
                        <div key={t.id} className="p-3">
                          <p className="font-black text-xs">₹{Number(t.amount || 0).toLocaleString()} - {t.reason}</p>
                          <p className="text-xs opacity-40">{new Date(t.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                      {myTrans.length === 0 && <p className="text-xs opacity-30 p-3">No transactions yet!</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
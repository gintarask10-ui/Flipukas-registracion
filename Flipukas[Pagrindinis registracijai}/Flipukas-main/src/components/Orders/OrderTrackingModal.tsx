import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Copy,
  Check,
  RefreshCw,
  Play,
  Pause,
  X,
  ExternalLink,
  Scissors,
  ShieldCheck,
  Building,
  Navigation,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/order';
import {
  ORDER_STATUS_ORDER,
  STATUS_META,
  getStoredOrders,
  updateOrderStatus,
  getNextStatus,
  getPrevStatus,
} from '../../utils/orderStorage';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  initialOrderNumber?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId,
  initialOrderNumber,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [simTimerSeconds, setSimTimerSeconds] = useState(10);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Load orders on open
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredOrders();
      setOrders(stored);
      if (initialOrderNumber) {
        const match = stored.find(
          (o) => o.trackingNumber === initialOrderNumber || o.id === initialOrderNumber
        );
        if (match) {
          setSelectedOrderId(match.id);
          return;
        }
      }
      if (initialOrderId && stored.some((o) => o.id === initialOrderId)) {
        setSelectedOrderId(initialOrderId);
      } else if (stored.length > 0) {
        setSelectedOrderId(stored[0].id);
      }
    }
  }, [isOpen, initialOrderId, initialOrderNumber]);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Auto-simulation timer: advances status every 8 seconds when turned on
  useEffect(() => {
    if (!isAutoSimulating || !activeOrder || activeOrder.status === 'delivered') return;

    const interval = setInterval(() => {
      setSimTimerSeconds((prev) => {
        if (prev <= 1) {
          handleAdvanceStatus();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoSimulating, activeOrder]);

  if (!isOpen || !activeOrder) return null;

  const currentStatusIndex = ORDER_STATUS_ORDER.indexOf(activeOrder.status);
  const activeMeta = STATUS_META[activeOrder.status];

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(activeOrder.trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleAdvanceStatus = () => {
    const next = getNextStatus(activeOrder.status);
    const updated = updateOrderStatus(activeOrder.id, next);
    if (updated) {
      setOrders(getStoredOrders());
      setStatusNotification(`Būsena atnaujinta: ${STATUS_META[next].titleLt}`);
      setTimeout(() => setStatusNotification(null), 3500);
    }
  };

  const handleStepBackStatus = () => {
    const prev = getPrevStatus(activeOrder.status);
    const updated = updateOrderStatus(activeOrder.id, prev);
    if (updated) {
      setOrders(getStoredOrders());
    }
  };

  const getStepIcon = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'cutting_sewing':
        return <Scissors className="w-4 h-4" />;
      case 'quality_check':
        return <ShieldCheck className="w-4 h-4" />;
      case 'courier_pickup':
        return <Package className="w-4 h-4" />;
      case 'in_transit':
        return <Truck className="w-4 h-4" />;
      case 'out_for_delivery':
        return <Navigation className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 bg-neutral-950/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  Siuntos ir Gamybos Sekimas
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Realaus laiko individualaus 3D drabužio gamybos ir pristatymo eiga
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Notification Pill */}
        {statusNotification && (
          <div className="bg-amber-400/10 border-b border-amber-400/30 px-6 py-2.5 text-xs text-amber-300 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-medium">{statusNotification}</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400/70">Realiu laiku</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6">
          {/* Top Info Banner: Order ID, Carrier, Tracking Code */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Užsakymo numeris:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {activeOrder.id}
                </span>
                {orders.length > 1 && (
                  <select
                    value={activeOrder.id}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="ml-2 px-2 py-1 bg-neutral-900 border border-neutral-750 rounded-lg text-xs text-amber-400 font-mono focus:outline-none"
                  >
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.id} ({STATUS_META[o.status].titleLt})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300 mt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Building className="w-3.5 h-3.5 text-neutral-400" />
                  {activeOrder.carrier}
                </span>
                <span className="text-neutral-600">•</span>
                <span className="flex items-center gap-1 font-mono text-neutral-200">
                  Nr.: {activeOrder.trackingNumber}
                  <button
                    onClick={handleCopyTracking}
                    title="Kopijuoti sekimo kodą"
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition ml-1"
                  >
                    {copiedTracking ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </span>
              </div>
            </div>

            {/* Estimated Delivery Status Box */}
            <div className="px-4 py-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col items-start md:items-end">
              <span className="text-[11px] font-mono uppercase text-neutral-400 tracking-wider">
                Numatomas atvykimas
              </span>
              <span className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                {activeOrder.status === 'delivered'
                  ? 'Siunta jau pristatyta!'
                  : activeOrder.estimatedDelivery}
              </span>
            </div>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Dabartinė fazė: {activeMeta.titleLt}
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {activeMeta.percent}%
              </span>
            </div>

            <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${activeMeta.percent}%` }}
              />
            </div>
          </div>

          {/* Live Timeline Stepper */}
          <div className="relative flex flex-col gap-0 border border-neutral-800 rounded-2xl bg-neutral-950/60 p-4 sm:p-5 overflow-hidden">
            <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4 flex items-center justify-between">
              <span>Gamybos ir pristatymo etapai</span>
              <span className="text-[11px] text-neutral-500 font-sans">
                Atnaujinta prieš kelias akimirkas
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {ORDER_STATUS_ORDER.map((stepKey, idx) => {
                const stepMeta = STATUS_META[stepKey];
                const isPassed = idx < currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                const isUpcoming = idx > currentStatusIndex;

                return (
                  <div key={stepKey} className="flex items-start gap-3.5 relative">
                    {/* Connecting vertical line */}
                    {idx < ORDER_STATUS_ORDER.length - 1 && (
                      <div
                        className={`absolute left-4 top-8 w-0.5 h-8 transition-colors ${
                          isPassed ? 'bg-amber-400/80' : 'bg-neutral-800'
                        }`}
                      />
                    )}

                    {/* Step Icon Node */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all ${
                        isCurrent
                          ? 'bg-amber-400 text-neutral-950 ring-4 ring-amber-400/20 shadow-lg'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-neutral-900 text-neutral-600 border border-neutral-800'
                      }`}
                    >
                      {getStepIcon(stepKey)}
                    </div>

                    {/* Step Text Info */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs font-bold leading-none ${
                            isCurrent
                              ? 'text-amber-400'
                              : isPassed
                              ? 'text-white'
                              : 'text-neutral-500'
                          }`}
                        >
                          {stepMeta.titleLt}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                            Vykdoma dabar
                          </span>
                        )}
                        {isPassed && (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Atlikta
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs mt-1 ${
                          isUpcoming ? 'text-neutral-600' : 'text-neutral-400'
                        }`}
                      >
                        {stepMeta.descLt}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono mt-1">
                        <MapPin className="w-3 h-3 text-neutral-500" />
                        <span>{stepMeta.locationLt}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Simulation Controls Panel */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                disabled={activeOrder.status === 'delivered'}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  isAutoSimulating
                    ? 'bg-amber-400 text-neutral-950 shadow-md'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                }`}
              >
                {isAutoSimulating ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Sustabdyti simuliaciją ({simTimerSeconds}s)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Paleisti realaus laiko simuliaciją</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAdvanceStatus}
                disabled={activeOrder.status === 'delivered'}
                className="py-2 px-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs text-white font-medium flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Kitas žingsnis</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleStepBackStatus}
              disabled={activeOrder.status === 'confirmed'}
              className="text-xs text-neutral-400 hover:text-white transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atstatyti ankstesnę būseną</span>
            </button>
          </div>

          {/* Recipient & Ordered Garments Summary */}
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-xs">
            <div className="font-bold text-white mb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Pristatymo detalės ir užsakyti gaminiai</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-400">
              <div>
                <span className="text-neutral-500 block">Gavėjas:</span>
                <span className="text-neutral-200 font-medium">
                  {activeOrder.customerName} ({activeOrder.customerEmail})
                </span>
                <span className="block mt-0.5">
                  {activeOrder.address}, {activeOrder.city} {activeOrder.postalCode}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Užsakyti drabužiai:</span>
                <div className="space-y-1 mt-0.5">
                  {activeOrder.items.map((item) => (
                    <div key={item.id} className="text-neutral-300 font-mono text-[11px]">
                      • {item.title} ({item.size}) — {item.fabricName}
                    </div>
                  ))}
                  <div className="text-amber-400 font-bold pt-1 font-mono">
                    Bendra vertė: {activeOrder.total.toFixed(2)} €
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <span className="text-xs text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Atnaujinimai sinchronizuojami su Omniva & DPD API</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition cursor-pointer"
          >
            Užverti sekimą
          </button>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import { scanEquipmentQr } from '../services/equipmentService';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

const QRScannerPage = () => {
  const navigate = useNavigate();
  const [resolving, setResolving] = useState(false);
  const [equipment, setEquipment] = useState(null);
  const [error, setError] = useState('');
  const [scanKey, setScanKey] = useState(0);

  const handleScanSuccess = async (decodedText) => {
    if (resolving) return; // avoid duplicate calls while the camera keeps firing
    setResolving(true);
    setError('');
    setEquipment(null);
    try {
      const data = await scanEquipmentQr(decodedText);
      setEquipment(data);
    } catch (err) {
      setError(err.response?.data?.error || 'This QR code does not match any equipment in LabTrack.');
    } finally {
      setResolving(false);
    }
  };

  const scanAgain = () => {
    setEquipment(null);
    setError('');
    setScanKey((k) => k + 1); // remounts the scanner component
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Scan Equipment QR Code</h1>
      <p className="text-gray-500 text-sm mb-6">
        Point your camera at the QR code attached to a piece of lab equipment.
      </p>

      {!equipment && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <QRScanner key={scanKey} onScanSuccess={handleScanSuccess} />
        </div>
      )}

      {resolving && <LoadingSpinner label="Looking up equipment..." />}

      <ErrorBanner message={error} />
      {error && (
        <Button variant="secondary" onClick={scanAgain}>Try Again</Button>
      )}

      {equipment && (
        <div className="mt-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{equipment.name}</h2>
              <p className="text-sm text-gray-400">{equipment.serial_number}</p>
            </div>
            <StatusBadge status={equipment.status} />
          </div>
          <dl className="text-sm text-gray-600 space-y-1.5 mb-5">
            <div className="flex justify-between"><dt className="text-gray-400">Category</dt><dd>{equipment.category_name}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Laboratory</dt><dd>{equipment.lab_name}</dd></div>
            {equipment.manufacturer && <div className="flex justify-between"><dt className="text-gray-400">Manufacturer</dt><dd>{equipment.manufacturer}</dd></div>}
            <div className="flex justify-between"><dt className="text-gray-400">Condition</dt><dd><StatusBadge status={equipment.condition} /></dd></div>
          </dl>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/equipment')}>View in Equipment List</Button>
            <Button variant="secondary" onClick={scanAgain}>Scan Another</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScannerPage;

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'labtrack-qr-reader',
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250
        },
        rememberLastUsedCamera: true
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        if (onScanSuccess) {
          onScanSuccess(decodedText);
        }
      },
      (errorMessage) => {
        if (onScanError) {
          onScanError(errorMessage);
        }
      }
    );

    return () => {
      scanner.clear().catch((error) => {
        console.error('Failed to clear QR scanner:', error);
      });
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full">
      <div
        id="labtrack-qr-reader"
        className="w-full"
      />
    </div>
  );
};

export default QRScanner;

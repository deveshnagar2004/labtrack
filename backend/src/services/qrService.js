const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const generateQrIdentifier = () => {
  return `LABTRACK-EQ-${uuidv4()}`;
};

const generateQrImage = async (qrCodeValue) => {
  const dataUrl = await QRCode.toDataURL(qrCodeValue, {
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 2
  });

  return dataUrl;
};

module.exports = {
  generateQrIdentifier,
  generateQrImage
};

export interface ScanResult {
  value: string;
  scanType?: string;
  charSet?: string;
}

export interface ScannerAdapter {
  scan(): Promise<ScanResult>;
}

export const scanner: ScannerAdapter = {
  scan(): Promise<ScanResult> {
    return new Promise((resolve, reject) => {
      uni.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode', 'barCode', 'datamatrix'],
        success: (result) => resolve({ value: result.result, scanType: result.scanType, charSet: result.charSet }),
        fail: (error) => reject(new Error(error.errMsg || '扫码失败')),
      });
    });
  },
};

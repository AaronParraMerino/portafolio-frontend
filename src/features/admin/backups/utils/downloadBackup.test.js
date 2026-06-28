import { downloadBackupBlob } from './downloadBackup';

describe('downloadBackupBlob', () => {
  test('crea un enlace temporal con nombre de descarga y libera la URL', () => {
    const blob = new Blob(['{}'], { type: 'application/json' });
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const createObjectURL = jest.fn(() => 'blob:backup');
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });

    downloadBackupBlob(blob, 'creafolio-completo.json');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:backup');
    expect(document.querySelector('a[download="creafolio-completo.json"]')).toBeNull();

    click.mockRestore();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('should strip id from update payload before persisting settings', async () => {
    const prisma = {
      setting: {
        findFirst: vi.fn().mockResolvedValue({ id: 'setting-1' }),
        update: vi.fn().mockResolvedValue({ id: 'setting-1', companyName: 'Société AMIN' }),
      },
    };

    const service = new SettingsService(prisma as any);

    await service.update({ id: 'setting-1', companyName: 'Société AMIN', currency: 'DT' });

    expect(prisma.setting.update).toHaveBeenCalledWith({
      where: { id: 'setting-1' },
      data: {
        companyName: 'Société AMIN',
        currency: 'DT',
      },
    });
  });
});

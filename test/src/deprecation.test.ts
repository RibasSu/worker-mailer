import { describe, expect, it, vi } from 'vitest'
import {
  PACKAGE_MIGRATION_WARNING,
  warnPackageMigration,
} from '../../src/deprecation'

describe('package migration warning', () => {
  it('recommends the replacement package', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    warnPackageMigration()

    expect(warn).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledWith(PACKAGE_MIGRATION_WARNING)
    expect(PACKAGE_MIGRATION_WARNING.replacement).toBe('@workermailer/smtp')

    warn.mockRestore()
  })
})

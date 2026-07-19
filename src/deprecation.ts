export const PACKAGE_MIGRATION_WARNING = {
  code: 'WORKER_MAILER_PACKAGE_MOVED',
  package: '@ribassu/worker-mailer',
  replacement: '@workermailer/smtp',
  message:
    '@ribassu/worker-mailer is moving to @workermailer/smtp. Migrate to @workermailer/smtp to keep receiving the latest updates.',
} as const

export function warnPackageMigration(): void {
  console.warn(PACKAGE_MIGRATION_WARNING)
}

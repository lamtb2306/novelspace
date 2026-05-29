# NovelSpace PostgreSQL Backup Cron

This guide sets up daily compressed PostgreSQL backups on the VPS.

## 1. Install tools

```bash
sudo apt update
sudo apt install -y postgresql-client gzip
```

## 2. Copy scripts on the VPS

Recommended location:

```bash
sudo mkdir -p /opt/novelspace/scripts
sudo cp scripts/backup.sh /opt/novelspace/scripts/backup.sh
sudo cp scripts/restore.sh /opt/novelspace/scripts/restore.sh
sudo chmod +x /opt/novelspace/scripts/backup.sh /opt/novelspace/scripts/restore.sh
```

## 3. Create backup and log folders

```bash
sudo mkdir -p /var/backups/novelspace/postgres
sudo mkdir -p /var/log/novelspace
sudo chown -R "$USER":"$USER" /var/backups/novelspace /var/log/novelspace
chmod 700 /var/backups/novelspace/postgres
```

## 4. Configure database access

Preferred: use `DATABASE_URL`.

```bash
export DATABASE_URL='postgresql://USER:PASSWORD@127.0.0.1:5432/DB_NAME'
```

Alternative: use standard PostgreSQL variables.

```bash
export PGHOST='127.0.0.1'
export PGPORT='5432'
export PGUSER='USER'
export PGDATABASE='DB_NAME'
export PGPASSWORD='PASSWORD'
```

Optional settings:

```bash
export BACKUP_DIR='/var/backups/novelspace/postgres'
export LOG_DIR='/var/log/novelspace'
export RETENTION_DAYS='14'
export BACKUP_PREFIX='novelspace_postgres'
```

## 5. Test backup manually

```bash
DATABASE_URL='postgresql://USER:PASSWORD@127.0.0.1:5432/DB_NAME' \
BACKUP_DIR='/var/backups/novelspace/postgres' \
LOG_DIR='/var/log/novelspace' \
RETENTION_DAYS='14' \
/opt/novelspace/scripts/backup.sh
```

Check output:

```bash
ls -lh /var/backups/novelspace/postgres
tail -n 50 /var/log/novelspace/postgres-backup.log
```

## 6. Add daily cron job

Open crontab:

```bash
crontab -e
```

Run backup every day at 03:20 server time:

```cron
20 3 * * * DATABASE_URL='postgresql://USER:PASSWORD@127.0.0.1:5432/DB_NAME' BACKUP_DIR='/var/backups/novelspace/postgres' LOG_DIR='/var/log/novelspace' RETENTION_DAYS='14' /opt/novelspace/scripts/backup.sh >> /var/log/novelspace/postgres-backup-cron.log 2>&1
```

If the password contains `%`, escape it as `\%` in cron.

## 7. Restore from a backup

List backups:

```bash
ls -lh /var/backups/novelspace/postgres
```

Restore with confirmation prompt:

```bash
DATABASE_URL='postgresql://USER:PASSWORD@127.0.0.1:5432/DB_NAME' \
/opt/novelspace/scripts/restore.sh /var/backups/novelspace/postgres/novelspace_postgres_YYYYMMDDTHHMMSSZ.sql.gz
```

Non-interactive restore for emergency automation:

```bash
RESTORE_CONFIRM=yes \
DATABASE_URL='postgresql://USER:PASSWORD@127.0.0.1:5432/DB_NAME' \
/opt/novelspace/scripts/restore.sh /var/backups/novelspace/postgres/novelspace_postgres_YYYYMMDDTHHMMSSZ.sql.gz
```

## Notes

- Backups are compressed with `gzip -9`.
- Old backups are deleted by `RETENTION_DAYS`.
- Logs are written to `postgres-backup.log` and `postgres-restore.log`.
- Keep `/var/backups/novelspace/postgres` private because dumps contain user data.

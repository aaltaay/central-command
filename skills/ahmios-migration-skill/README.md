# 🚀 AhmiOS Migration Skill

This skill automates the migration of your entire AhmiOS development environment—including repositories, configurations, custom agent skills, task history, chat memory, and secrets—from your current laptop to a new laptop.

---

## 📦 What gets migrated
1. **API Keys & Secrets:** `.env.secrets` containing your GitHub, Vercel, Supabase, and AI keys.
2. **Workspaces & Repositories:** All folders in `C:\Users\<user>\.gemini\antigravity\scratch\` (excluding bulky directories like `node_modules`, `.next`, `dist`, and cache folders to keep the package lightweight).
3. **Custom Skills:** All skills under `C:\Users\<user>\github\AhmiOS\`.
4. **Configuration & Project Lists:** Global permissions, MCP configuration, and project definitions.
5. **Conversations & Task Traces:** All your background memory states and conversation logs.

---

## 🏃‍♂️ How to Run the Migration

### Step 1: Run the Backup on your Current Laptop
Open PowerShell and run the backup script:
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\aalta\github\AhmiOS\ahmios-migration-skill\backup-ahmios.ps1"
```
*   **Result:** A file named `ahmios_backup.zip` will be created directly on your **Desktop**.

---

### Step 2: Copy Package to the New Laptop
Transfer `ahmios_backup.zip` and the `restore-ahmios.ps1` script from this folder to the new laptop (via USB drive, cloud storage, or network share). 

Make sure to place both files on the **Desktop** of the new laptop.

---

### Step 3: Run the Restore on the New Laptop
Open PowerShell on the new laptop and run the restore script:
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Desktop\restore-ahmios.ps1"
```
*   **Result:** The script will automatically unpack the files, configure target folders, recreate symlinks, and **auto-correct any paths** in environment files, projects, and MCP settings to match your new laptop's username.

---

### Step 4: Re-initialize Dependencies
Once restored, open your Antigravity IDE on the new laptop, navigate into your workspaces (e.g. `altay_studio`), and restore packages:
- **Node.js/Next.js/React:** `npm install`
- **Python:** `python -m venv venv`, `.\venv\Scripts\Activate.ps1`, `pip install -r requirements.txt`

You are now fully set up and ready to continue working without affecting your velocity!

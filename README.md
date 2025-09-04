# KleinManager

KleinManager is a FastAPI + Jinja2 + SQLite desktop-style web application, bundled into a single executable using **PyInstaller**.  
It runs a local web server and automatically opens the application in the browser.

---


<img width="2546" height="1295" alt="Screenshot 2025-09-03 155620" src="https://github.com/user-attachments/assets/75b6cf28-3f52-4581-acfa-8a8b0e559948" />




## 📦 Requirements

- **Python 3.11+**
- **Virtual environment** (recommended)
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

---

## ⚙️ Project Structure

```
KleinManager/
├── app/
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   ├── api/
│   │   ├── routes.py
│   └── ...
├── templates/          # Jinja2 HTML templates
├── static/             # JS, CSS, images
├── images/             # Uploaded/generated images
├── kleinmanager.db     # SQLite database
├── main.py             # FastAPI entrypoint
├── main.spec           # PyInstaller build configuration
```

---

## 🛠️ Building the Executable

### 1. Install PyInstaller
```bash
pip install pyinstaller
```

### 2. Build using the spec file
```bash
pyinstaller main.spec
```

⚠️ Do **not** use `--onefile` or `--onedir` flags when building with a `.spec` file.  
The `.spec` already defines the build mode.

---

## 🔥 One-file Executable Mode

The project is configured to bundle everything (`templates`, `images`, and `kleinmanager.db`) into a **single `.exe`**.  

⚠️ **Important:** The `static` folder (JS, CSS, assets) must be **manually copied** into the `dist/KleinManager/` directory after building.  
Without this step, the app will fail to serve static files.

---

## ▶️ Running the App

After a successful build:

- Navigate to `dist/`
- Run:
  ```bash
  KleinManager.exe
  ```

The app will:
- Start a local FastAPI server at **http://localhost:8000**
- Automatically open the browser
- Serve static files (JS, CSS) if the `static` folder is copied manually to the same directory as the executable.

---

## 🐛 Troubleshooting

- **Missing `static` or `templates`**  
  Make sure `templates` are included in the `.spec`, and copy `static` manually into `dist/KleinManager/`.

- **Logger error (`isatty`)**  
  Use `uvicorn.run(..., log_config=None)` in `main.py` to disable default colored logging in onefile builds.

- **Icons**  
  Replace `app.ico` in `main.spec` with your own or remove the `icon` line.

---

## ✅ Example Build Command

```bash
# Clean old build
rmdir /s /q build dist __pycache__

# Rebuild exe
pyinstaller main.spec

# Copy static manually
xcopy static dist\KleinManager\static /E /I
```

Result:  
```
dist/
├── KleinManager.exe
├── static/        # <- copied manually
└── templates/
```

Double-click `KleinManager.exe` → Browser opens → App is ready.

<<<<<<< HEAD
# Study Guard: VS Code Sleep Alarm (Browser-based Tracking)

This extension monitors your eyes while you study or code. Because VS Code restricts webcam access in Webviews due to security guidelines, this extension uses a hybrid architecture:

1. **Local Server**: VS Code runs a lightweight server in the background.
2. **Browser Engine**: You open the monitor console in your default web browser, which has full webcam privileges.
3. **Pulsing Alarm**: If you close your eyes for longer than a set duration (e.g. 1.5 seconds), a loud buzzer alarm sounds from your browser, a warning dialog pops up in VS Code, and a new document containing `"WAKE UP!"` spam automatically opens to snap you out of your sleep.

---

## 🛠️ Getting Started & Launching

To run and test the extension locally:

1. **Open the project folder in VS Code**:
   * Open VS Code, select **File > Open Folder...**, and select this directory:
     `C:\Users\sk sanjay\.gemini\antigravity\scratch\sleep-alarm`
   * *Alternatively, set this folder as your active workspace.*

2. **Launch the Extension Host**:
   * Open the file `extension.js` inside VS Code.
   * Press **`F5`** (or go to `Run` -> `Start Debugging`).
   * A new window titled `[Extension Development Host]` will open. This is a separate VS Code instance running your extension.

3. **Activate the Panel**:
   * In the new window, look at the **Activity Bar** on the far left.
   * Click on the **Eye Icon** (Sleep Alarm Container).
   * The **Study Guard Console** panel will render in the sidebar.

4. **Launch the Tracker**:
   * Click the **🚀 Open Tracker in Browser** button.
   * Your default web browser will open a page at `http://127.0.0.1:XXXXX/`.
   * Grant webcam access in the browser when prompted.
   * Position yourself so your face is visible in the preview box. You will see real-time eye telemetry bars update!

---

## ⚙️ Customization

* **Trigger Delay**: Adjust the slider (0.5s to 4.0s) in the browser to change how long your eyes must be closed before the siren activates. The default is **1.5s** to prevent normal blinking from sounding the alarm.
* **Sensitivity**: Adjust the percentage threshold for what counts as "closed". A higher percentage means your eyelids must be almost completely shut to trigger.
* **Test Alarm Sound**: Click the "Test Alarm Sound" button on the browser page to verify your speakers are active.
=======
# Study_Guard
>>>>>>> 60d63421aa898362d7c7ab8c5a3882befdbf9650

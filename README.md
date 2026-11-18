# Emmanuel Abimbola IT & Cybersecurity Portfolio

An interactive Information Technology portfolio with a cybersecurity demonstration layer.

## Included
- Responsive personal portfolio
- Authentication and authorization classroom demo
- Login and sign-up pages
- Mannie AI assistant with text, voice input, and spoken responses
- General-knowledge and cybersecurity responses in Mannie
- Interactive Cyber Arcade
  - Spot the Phish
  - Password Lab
  - Firewall Defender
  - Bug Hunter
  - Cyber Quiz
  - Incident Response
- XP, levels, badges, local progress, player card, and leaderboard
- Cyber Mode visual toggle
- Animated security events
- Hidden terminal Easter egg: type `terminal` on the page
- Animated interactive background

## Run
Open `index.html` in a browser. No server or build step is required.

## Classroom note
The authentication and authorization features are intentionally front-end demonstrations for coursework. They are not a production authentication system because credentials are stored in client-side JavaScript/local storage.


## Midterm presentation additions
- Coursework overview section (verify that each item is actually completed and relevant before presenting).
- Research project section for CIC-IDS2017 Network Intrusion Detection.
- Research question, dataset links, goals, Random Forest and Decision Tree descriptions.
- Preliminary results table with placeholders; replace these with the exact metrics from the Kaggle notebook.
- Limitations and future-work plan.

## Before presenting
1. Replace all `[Add result]` placeholders in the research section with actual metrics from the Kaggle notebook.
2. The public Kaggle notebook is linked in the research section: https://www.kaggle.com/code/emmanuelabimbola/network-intrusion-detection-using-machine-learning
3. Verify the coursework list and add links to completed homework deliverables where possible.
4. Note that the login and signup links in the current page need matching `login.html` and `signup.html` files if you want those buttons to work.


Midterm research section includes a main research question, supporting questions, a summary of the selected CIC-IDS2017 sample (20,000 records from each selected group; approximately 40,000 total), experiment workflow, model comparison, security relevance, limitations, and next steps. Replace the metric placeholders only with values from the executed Kaggle notebook.


The Midterm Research section includes an overview of the Kaggle notebook workflow: selected CIC-IDS2017 traffic, approximately 40,000 sampled records, exploratory analysis, Random Forest and Decision Tree comparison, confusion-matrix review, and feature-importance exploration. Confirm actual metric outputs in Kaggle before replacing the results placeholders.


## Assignment 7 — DoS/DDoS research

The home page now includes a dedicated **Assignment 7** section covering DoS versus DDoS, the CIC-IDS2017 dataset, relevant labels, normal/attack traffic characteristics, the analysis workflow, evaluation metrics, limitations, and the AI movie placeholder. The earlier Midterm Research results are explicitly scoped to the earlier benign-versus-brute-force experiment; they are not DoS/DDoS results.

### Run the DoS/DDoS analysis

1. Download the labeled CIC-IDS2017 CSV files from the [official Canadian Institute for Cybersecurity dataset page](https://www.unb.ca/cic/datasets/ids-2017.html) or use the linked [Hugging Face dataset](https://huggingface.co/datasets/c01dsnap/CIC-IDS2017).
2. Extract the CSV files into a folder on your computer. Include files containing BENIGN traffic and the DoS/DDoS labels (Wednesday DoS files and Friday DDoS file).
3. From this project folder, install the analysis dependencies:

   ```bash
   python -m pip install -r analysis/requirements.txt
   ```

4. Run the script, replacing the path with the folder where you extracted the CSV files:

   ```bash
   python analysis/dos_ddos_analysis.py --csv-dir "/path/to/CICIDS2017/CSVs"
   ```

5. The script saves actual charts and model output in `assets/assignment7/results/`: `traffic_class_counts.png`, `packet_rate_comparison.png` (when the flow packet-rate column is present), `confusion_matrix.png`, and `metrics.json`. Review the output and add the measured values to the Assignment 7 results table before submission.

The script uses a balanced sample (up to 50,000 flows per class by default) and a stratified random train/test split. This is an initial classroom experiment, not proof of production readiness. For stronger evaluation, use a time/day-based holdout and test on an independent dataset. The script analyzes public files only; it does not send traffic or attack any network.

### Add the Google Flow movie

1. Generate and export your movie as an MP4 from [Google Flow](https://labs.google/fx/tools/flow).
2. Copy the exported file into `assets/assignment7/` and name it `cybersecurity-ddos-movie.mp4`.
3. In `index.html`, find the `movie-placeholder` block inside `section id="movie"` and replace that entire `div` with:

   ```html
   <video controls playsinline preload="metadata" style="width:100%;border-radius:14px" poster="assets/assignment7/movie-poster.jpg">
     <source src="assets/assignment7/cybersecurity-ddos-movie.mp4" type="video/mp4">
     Your browser does not support HTML video.
   </video>
   ```

   The `poster` attribute is optional; remove it if you do not create a poster image.
4. Open `index.html` locally and test playback. Commit and push the MP4 and updated HTML to the same GitHub repository used to publish the website. Large video files may exceed GitHub's normal file-size limit; if so, host the video on a supported video platform and embed its player instead.

### Before submitting

- Run the analysis script and verify the actual `metrics.json` values.
- Update the Assignment 7 results table with measured precision, recall, F1-score, and confusion-matrix counts. Do not copy the old Midterm scores into this table.
- Add the exported AI movie and confirm that it plays on the published website.
- Test the public website URL in a private/incognito browser window.
- Submit the published website URL, not the GitHub repository URL.

(function () {

  const form = /** @type {HTMLFormElement} */ (document.querySelector('#input'));
  const output = /** @type {HTMLTextAreaElement} */ (document.querySelector('#cuesheet_output'));
  const copyBtn = /**@type {HTMLButtonElement} */ (document.querySelector('#output #copy'));

  form.onsubmit = (ev) => {
    ev.preventDefault();
    const fields = /** @type {FormFields} */ (Object.fromEntries(new FormData(form)));
    output.textContent = [
      `PERFORMER "${fields.album_artist}"`,
      `TITLE "${fields.album_title}"`,
      `FILE "${fields.filename}" WAVE`,
      parseAudacityLabels(fields.audacity_labels_txt),
    ].join('\n');
  };

  copyBtn.onclick = (ev) => {
    ev.preventDefault();
    output.select();
    try {
      navigator.clipboard.writeText(output.textContent);
      copyBtn.textContent = 'Copied';
      setTimeout(() => {
        copyBtn.textContent = 'Copy to clipboard';
      }, 3000);
    }
    catch (err) {
      console.error(err);
    }
  }


  // functions

  function parseAudacityLabels(str = '') {
    const lines = str.split('\n');
    const indexDigits = String(lines.length).length;
    const output = [];
    let index = 0;
    for (const line of lines) {
      if (!line) continue;
      index++;
      const cols = line.replace(' - ', '\t').split('\t');
      const track = {
        artist: cols[2],
        title: cols[3],
        start: cols[0],
        end: cols[1],
      };
      output.push([
        `  TRACK ${addLeadingZeroes(index, indexDigits)} AUDIO`,
        `    PERFORMER "${track.artist}"`,
        `    TITLE "${track.title}"`,
        `    INDEX 01 ${formatTrackDuration(track.start)}`
      ].join('\n'));
    }
    return output.join('\n');
  }

  function addLeadingZeroes(num = 0, digits = 0) {
    let str = String(num);
    while (str.length < digits) str = '0' + str;
    return str;
  }

  function formatTrackDuration(seconds = 0) {
    // 3365.847755
    let m, s, ms, fr;
    s = parseInt(seconds); // 3365
    ms = seconds - s; // 0.847755
    fr = Math.round(ms * 75); // 64
    m = s / 60; // 56.08333333333333
    s = Math.round((m - parseInt(m)) * 60); // 5
    m = parseInt(m); // 56
    let output = [
      m,
      addLeadingZeroes(s, 2),
      addLeadingZeroes(fr, 2)
    ].join(':');
    // 56:05:64
    return output;
  }

})();


/**
 * @typedef {object} FormFields
 * @property {string} album_artist
 * @property {string} album_title
 * @property {string} filename
 * @property {string} audacity_labels_txt
 */

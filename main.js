(function () {

  const form = /** @type {HTMLFormElement} */ (document.querySelector('#input'));
  const output = /** @type {HTMLTextAreaElement} */ (document.querySelector('#cuesheet_output'));
  const copyBtn = /**@type {HTMLButtonElement} */ (document.querySelector('#output #copy'));

  form.onsubmit = (ev) => {
    ev.preventDefault();
    try {
      const fields = /** @type {FormFields} */ (Object.fromEntries(new FormData(form)));
      output.textContent = [
        `PERFORMER "${fields.album_artist}"`,
        `TITLE "${fields.album_title}"`,
        `FILE "${fields.filename}" WAVE`,
        parseAudacityLabels(fields.audacity_labels_txt),
      ].join('\n');
    }
    catch (err) {
      alert(err);
      console.error(err);
    }
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
      alert('Failed to copy to clipboard. Please copy manually instead.');
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
        artist: cols[3] ? cols[2] : '',
        title: cols[3] ? cols[3] : cols[2],
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
    // 3365.847755 => 56:05:64
    let fr = addLeadingZeroes(Math.round(seconds % 1 * 75), 2); // 64
    let s = addLeadingZeroes(parseInt(seconds % 60), 2); // 05
    let m = parseInt(seconds / 60); // 56
    return [m, s, fr].join(':');
  }

})();


/**
 * @typedef {object} FormFields
 * @property {string} album_artist
 * @property {string} album_title
 * @property {string} filename
 * @property {string} audacity_labels_txt
 */

document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.querySelector('#theme-toggle');
    const themeLabel = document.querySelector('#theme-label');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
      document.body.classList.add(currentTheme);
      if (currentTheme === 'dark-mode') {
        toggleSwitch.checked = true;
        themeLabel.textContent = 'Light';
      } else {
        themeLabel.textContent = 'Dark';
      }
    }

    toggleSwitch.addEventListener('change', function () {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark-mode');
        themeLabel.textContent = 'Light';
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light-mode');
        themeLabel.textContent = 'Dark';
      }
    });
  });

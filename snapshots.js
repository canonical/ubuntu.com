module.exports = [
  {
    name: '/',
    url: 'http://localhost:8001/',
    "waitForTimeout": 1000,
    execute: {
      beforeSnapshot() {
        document.querySelector(".cookie-policy").style.display = "none";
      },
    }
  },
  {
    name: '/dowload/desktop',
    url: 'http://localhost:8001/download/desktop',
    "waitForTimeout": 1000,
  },
]


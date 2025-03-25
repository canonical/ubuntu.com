module.exports = [
  {
    name: 'Homepage',
    url: 'http://localhost:8001/',
    "waitForTimeout": 1000,
    execute: {
      beforeSnapshot() {
        document.querySelector(".cookie-policy").style.display = "none";
      },
    }
  }
]


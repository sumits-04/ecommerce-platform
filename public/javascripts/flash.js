window.addEventListener("load", function () {
  const flash = document.querySelector(".flash-message");
  setTimeout(function () {
    flash.style.opacity = "0";

    setTimeout(function () {
      flash.remove();
    }, 500);
  }, 3000);
});

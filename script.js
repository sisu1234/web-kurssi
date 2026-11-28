const haku = document.querySelector("#haku");
const hakutulos = document.querySelector("#hakutulos");
const ottelut = [...document.querySelectorAll("#ottelulista .ottelu")];

if (haku && hakutulos && ottelut.length) {
  function suodataLista() {
    const hakusana = haku.value.trim().toLocaleLowerCase("fi");
    let osumia = 0;

    ottelut.forEach((ottelu) => {
      const loytyy = ottelu.textContent
        .toLocaleLowerCase("fi")
        .includes(hakusana);

      ottelu.hidden = !loytyy;
      if (loytyy) osumia++;
    });

    hakutulos.textContent = hakusana
      ? `Näytetään ${osumia} hakutulosta.`
      : `Näytetään kaikki ${osumia} kohtaa.`;
  }

  haku.addEventListener("input", suodataLista);
  suodataLista();
}

const lomake = document.querySelector("#ilmoittautuminen");

if (lomake) {
  const kentat = [...lomake.querySelectorAll("input[required], select[required]")];
  const onnistuminen = document.querySelector("#onnistuminen");
  const virheYhteenveto = document.querySelector("#virhe");
  const tallennusavain = "lapuanLepakotIlmoittautuminen";

  kentat.forEach((kentta) => {
    const virheId = `${kentta.id}-virhe`;
    let virheTeksti = document.getElementById(virheId);

    if (!virheTeksti) {
      virheTeksti = document.createElement("span");
      virheTeksti.id = virheId;
      virheTeksti.className = "kenttavirhe";
      virheTeksti.hidden = true;
      kentta.insertAdjacentElement("afterend", virheTeksti);
    }

    kentta.setAttribute("aria-describedby", virheId);
  });

  function naytaVirhe(kentta) {
    const virheTeksti = document.getElementById(`${kentta.id}-virhe`);

    if (kentta.validity.valueMissing) {
      virheTeksti.textContent = "Tämä kenttä on pakollinen.";
    } else if (kentta.validity.typeMismatch) {
      virheTeksti.textContent = "Anna kelvollinen sähköpostiosoite.";
    } else {
      virheTeksti.textContent = kentta.validationMessage || "Tarkista kentän tieto.";
    }

    virheTeksti.hidden = false;
    kentta.setAttribute("aria-invalid", "true");
  }

  function poistaVirhe(kentta) {
    const virheTeksti = document.getElementById(`${kentta.id}-virhe`);
    virheTeksti.textContent = "";
    virheTeksti.hidden = true;
    kentta.removeAttribute("aria-invalid");
  }

  try {
    const tallennetut = JSON.parse(localStorage.getItem(tallennusavain) || "{}");
    kentat.forEach((kentta) => {
      if (typeof tallennetut[kentta.name] === "string") {
        kentta.value = tallennetut[kentta.name];
      }
    });
  } catch {
    // Tallennus ei ole käytettävissä; lomaketta voi silti käyttää.
  }

  function tallennaTiedot() {
    const tiedot = Object.fromEntries(
      kentat.map((kentta) => [kentta.name, kentta.value])
    );

    try {
      localStorage.setItem(tallennusavain, JSON.stringify(tiedot));
    } catch {
      // Tallennus ei ole käytettävissä; lomaketta voi silti käyttää.
    }
  }

  kentat.forEach((kentta) => {
    kentta.addEventListener("input", () => {
      if (kentta.validity.valid) poistaVirhe(kentta);
      tallennaTiedot();
    });

    kentta.addEventListener("change", () => {
      if (kentta.validity.valid) poistaVirhe(kentta);
      tallennaTiedot();
    });
  });

  lomake.addEventListener("submit", (tapahtuma) => {
    tapahtuma.preventDefault();
    onnistuminen.textContent = "";
    virheYhteenveto.textContent = "";

    let ensimmainenVirheellinen = null;

    kentat.forEach((kentta) => {
      if (!kentta.validity.valid) {
        naytaVirhe(kentta);
        ensimmainenVirheellinen ||= kentta;
      } else {
        poistaVirhe(kentta);
      }
    });

    if (ensimmainenVirheellinen) {
      virheYhteenveto.textContent = "Tarkista lomakkeen virheelliset kentät.";
      ensimmainenVirheellinen.focus();
      return;
    }

    onnistuminen.textContent =
      "Tiedot on tarkistettu, mutta niitä ei lähetetty. Ota yhteyttä joukkueeseen erikseen.";
  });
}

const popoverPainike = document.querySelector("#popover-painike");
const popoverSisalto = document.querySelector("#popover-sisalto");

if (popoverPainike && popoverSisalto) {
  popoverPainike.setAttribute("aria-expanded", "false");
  popoverPainike.setAttribute("aria-controls", "popover-sisalto");
  popoverSisalto.hidden = true;

  function suljePopover(palautaFokus = false) {
    popoverSisalto.hidden = true;
    popoverPainike.setAttribute("aria-expanded", "false");

    if (palautaFokus) popoverPainike.focus();
  }

  popoverPainike.addEventListener("click", () => {
    const avataan = popoverSisalto.hidden;
    popoverSisalto.hidden = !avataan;
    popoverPainike.setAttribute("aria-expanded", String(avataan));

    if (avataan) {
      popoverSisalto.querySelector("a, button, input")?.focus();
    }
  });

  popoverSisalto.addEventListener("keydown", (tapahtuma) => {
    if (tapahtuma.key === "Escape") suljePopover(true);
  });

  document.addEventListener("click", (tapahtuma) => {
    if (
      !popoverSisalto.hidden &&
      !popoverSisalto.contains(tapahtuma.target) &&
      !popoverPainike.contains(tapahtuma.target)
    ) {
      suljePopover();
    }
  });
}
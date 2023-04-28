# 24u_vector_game

## Tekening

1. Surf naar <https://editor.method.ac/>
2. Klik op View > Source... en voeg `id="tekening"` toe bij `<svg>`

### Teken de romp van het monster

1. Teken **rechthoek** gevuld in bepaalde kleur
2. **Rond hoeken** van rechthoek af
3. Teken witte **cirkel** en zwarte cirkel als oog
4. Voeg extra nodes toe aan de rechthoek om een mond uit de rechthoek te snijden. Zet **Seg Type** op **Curve** om gekromed lijnen te kunnen maken
5. Gebruik de **Path Tool** om tand en haartjes te tekenen
6. Groepeer alles en geef id "romp" via View > Source...

### Teken armen

1. Teken pad voor rechterarm en kopieer, plak en verschuif voor linkerarm
2. Geef ids "rechterarm" en "linkerarm"
3. Gebruik "**send to back**" om linkerarm achter lijf te zetten

### Teken benen

1. Teken zo ook beide benen, met id's "linkerbeen" en "rechterbeen"
2. Selecteer alle ledematen en romp, groepeer en geef id "wezen"

### Score

1. Maak een tekstvakje "Score: 0" en geef het de id "score"
2. Maak nog een tekstvakje "High score: 0" en geef het de id "high-score"
3. Kies een **font family** en een **font size**

### Bom

1. Teken een zwarte cirkel en een zwarte rechthoek en plaats de rechthoek op de cirkel.
2. Aligneer het midden van de rechthoek met het midden van de cirkel
3. Teken een lontje op de rechthoek
4. Groepeer en geef id "bom"

### Leven

1. Klik op de polygon-tool en selecteer het hartje om een hartje te tekenen
2. Geef id "leven"

### Sla op!

1. Klik op File > Save Image...
2. Het SVG-bestand wordt gedownload. **Stuur dit bestand naar jezelf door** (bv. via SmartSchool)

## Game

### Plak je tekening in `Vector Runner.html`

1. Open je SVG-bestand met **Kladblok**
2. Ga naar <https://florisdf.github.io/24u_vector_game/>, klik met de rechtermuisknop ergens op de lege pagina, en selecteer "Pagina opslaan als..."
3. Sla de pagina (`Vector Runner.html`) ergens op waar je het kan terugvinden
4. Ga naar de locatie waar je `Vector Runner.html` hebt opgeslagen, klik erop met de rechtermuisknop en open het met **Kladblok**
5. Kopieer de tekst uit het SVG-bestand en plak het op de juiste plaats in `Vector Runner.html`

### Laat het mannetje bewegen!

1. Dubbelklik al eens op het bestand `Vector Runner.html`. Je zou nu jouw mannetje al moeten zien.
2. Ga terug naar Kladblok waar je `Vector Runner.html` had geopend
3. Scroll naar beneden tot je de lijn met `rBeen.setAttribute("transform", `rotate(${0})`);` ziet staan
4. Verander de `0` naar een andere hoek en sla op.
5. Hernieuw de webpagina met het spelletje. Wat zie je?
6. Zoek nu een manier om het rechterbeen blijvend te laten bewegen
7. Eens dit gelukt is, pas hetzelfde to op het andere been en de armen

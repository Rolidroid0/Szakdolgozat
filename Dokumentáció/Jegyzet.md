# Ütközetek játékmód 2 játékos esetén
1. Essos játéktábla
2. Essos területkártyák (34 db)
3. Seregek (Ghiscari, Targaryen, semleges seregek)
- Játék kezdete: mindkét fél dob, aki nagyobbat dob választ házat
- 12-12 kártya kisorsolása random, maradék 10 semleges
- minden területen 2 sereg
- végül pakli aljára a játék vége kártya random (Valar Morghulis)
### Játékmenet
1. Erősítés (területek, régiók, kártyák majd elhelyezés)
2. Invázió
3. Manőver
4. Húzás

### Mezők
1. Terület: név (id), vár, kikötő, régió (fk), szomszédok, seregek száma, birtokos (fk), támadtakInnen*
2. Játékos: ház (id), pluszSeregek, hódított**
3. Régió: név (id), régióBónusz, területekSzáma
4. Területkártya***: név (id), birtokos (fk), szimbólum
5. Csata: honnan (fk), hová (fk), támadó seregek száma

*Azt mutatja, hogy adott körben innen indult-e már támadás, mert egy körben csak egyszer lehet. Minden kör elején hamis lesz az értéke.

**Azt mutatja, hogy az adott körben hódított-e már a játékos sikeresen területet.

***Van köztük egy különleges, a játék vége kártya.

((régibónusz jár e: COUNT területNév FROM területek WHERE birtokos = ház AND régió = régióNév -- ezt minden régióval és megnézni, hogy egyenlő-e a régió területeinek számával))
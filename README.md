# GrozCalc — grozu kaloriju kalkulators

**RTU studentu projekts · Rīga, 2026**

**Autori:** Deniss Smirnovs (241RDB243), Vladislavs Hatiņecs (241RDB015), Daniils Galviņš (241RDB283).

## Projekta mērķis

GrozCalc ir uztura uzskaites tīmekļa prototips, kas palīdz atrast pārtikas produktus Latvijas veikalos, reģistrēt patērēto daudzumu, aprēķināt kalorijas un makroelementus, pārvaldīt izlasi un melno sarakstu, kā arī sekot individuāliem mērķiem.

## Realizētās tehnoloģijas

- **Tīmekļa saskarne:** React, TypeScript, Vite, CSS un pašveidotas SVG ikonas.
- **Serveris:** Node.js, Express, Zod ievades validācija.
- **Datubāze:** PostgreSQL 16 (SQL tabulas, atslēgas, saites, indeksēšana).
- **Autentifikācija:** reģistrācija un pierakstīšanās, scrypt ar sāli, servera sesijas un HttpOnly sīkdatnes.
- **Piekļuves kontrole:** lietotājs / administrators; kontam piesaistīti dati.
- **Valodas:** latviešu un angļu saskarnes pārslēgšana (atsevišķi kļūdu un stūra gadījumi vēl jāpārbauda).
- **Pārbaudes:** TypeScript/Vite būve, JavaScript sintakses pārbaudes, katalogu datu pārbaude un PostgreSQL API integrācijas tests GitHub Actions vidē.

Projekta sākotnējā specifikācijā paredzēts arī React Native, Python datu iegūšana, OAuth/Firebase un mākoņhostings. **Šīs daļas nav realizētas šajā tīmekļa prototipā**; pašreizējā autentifikācija izmanto servera sesijas, nevis OAuth.

## Funkcionalitāte

1. **Produktu katalogs:** meklēšana, veikalu filtrs (Rimi, Maxima, Lidl), uzturvērtība uz 100 g, uztura ieteikumu etiķetes un informācija par datu izcelsmi.
2. **Dienasgrāmata:** produkta pievienošana, gramu maiņa, dzēšana, dienas kaloriju un makroelementu aprēķins.
3. **Konts:** reģistrācija, pierakstīšanās, kontam piesaistīti individuāli produkti, dienasgrāmata, izlase, melnais saraksts, mērķi un saglabāti iestatījumi.
4. **Analītika:** dienas un pēdējo septiņu dienu uztura pārskats.
5. **Administrators:** kopīgā SQL kataloga produktu izveide, dzēšana, attēlu augšupielāde, avotu pārskatīšana, JSON imports un eksports.
6. **Datu eksports:** autentificēta lietotāja datu lejupielāde JSON formātā.

### Datu uzticamība

- **55 demonstrācijas produkti:** ilustratīvas uzturvērtības, nav apstiprinātas konkrētu veikalu preces.
- **20 Rimi un 20 Maxima ieraksti:** individuālas produktu saites un uzturvērtības, taču etiķešu neatkarīga gala pārbaude vēl ir nepieciešama. Avota saite **nenozīmē** pārbaudītu vērtību.
- **20 Lidl ieraksti:** pēc līdzīgu produktu kategorijām **aplēstas, nepārbaudītas** uzturvērtības. Saskarnē marķētas ar **◷ Aplēse · izstrādē / Estimated · WIP**, dzintarkrāsas brīdinājumu un kategorijas atsauci. Šie dati nav precīzs konkrēta Lidl iepakojuma uzturvērtības apgalvojums.

**Nedrīkst prezentēt visus 60 ierakstus kā verificētus.** Precīzai uztura uzskaitei jāpārbauda produkta etiķete.

## Lokālā palaišana

Nepieciešams Node.js 22+, Docker Desktop vai PostgreSQL 16.

```bash
git clone -b dev/initial-prototype https://github.com/davlhat/GrozCalc.git
cd GrozCalc
npm install
cd server
npm install
```

Izveidojiet `server/.env` pēc `server/.env.example` parauga un palaidiet PostgreSQL (skat. `docker-compose.yml`). Tad:

```bash
cd server
npm run db
npm run dev
```

Atsevišķā terminālī no projekta saknes:

```bash
npm run dev -- --host localhost --port 5173 --strictPort
```

**Svarīgi:** palaidiet tikai **vienu** backend procesu portā `3001`; atkārtota palaišana izraisa `EADDRINUSE`.

## Vienreizēja pārbaude pirms prezentācijas

```bash
node scripts/check-products.mjs
npm run build
cd server
npm run db
```

Automatizēto API integrācijas testu `node scripts/integration.mjs` palaidiet **tikai atsevišķā testu datubāzē** (tests izveido lietotājus un ierakstus). CI vidē PostgreSQL serviss tiek izveidots automātiski.

## Dokumentācija

- [Universitātes demonstrācijas scenārijs un pieņemšanas pārbaude](docs/DEMO_AND_TEST_PLAN.md)
- [Realizācijas audits un atlikušās prasības](docs/RELEASE_AUDIT.md)
- [Komandas lokālās palaišanas instrukcijas](docs/TEAM_SETUP.md)
- [Backend un datubāzes apraksts](server/README.md)

## Atsauces uz prasību dokumentāciju

- *GrozCalc — Sistēmas prasību specifikācija* (2026).
- *GrozCalc — Sistēmas projektējums* (2026).

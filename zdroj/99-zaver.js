/* ==== záverečné vykreslenie ==== */
/* Uložená hra sa prvý raz vykreslí už na konci game.js, ešte pred úpravami ďalších modulov (napr. zjednodušené záložky).
   Tu sa po načítaní všetkých modulov vykreslí znova, aby hráč hneď videl konečnú podobu rozhrania. */
try{if(typeof window.render==="function"&&typeof S!=="undefined"&&S&&!S.over)window.render()}catch(e){console.warn("zaverecne vykreslenie",e)}

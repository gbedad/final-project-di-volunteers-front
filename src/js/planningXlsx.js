// Excel export of the planning of one week, with the colours of the room sheet
// kept by the team (room colours, coloured times, struck-through breaks, red
// remarks for room conflicts). The CSV export stays as it is.
import ExcelJS from 'exceljs';

const KIND_LABEL = {
  regular: null,
  supplementaire: 'Séance supplémentaire',
  remplacement: 'Remplacement',
  pause: 'Pause',
};

// Header band of each column, as on the team's sheet
const HEADER = {
  date: 'FFD9B3FF',
  time: 'FFB3F0FF',
  people: 'FF7030A0',
  room: 'FFFFF2CC',
  place: 'FFCCFF66',
  other: 'FFE7E6E6',
};

// Room colour by site, with Salle Haute in lavender as on the sheet
const SITE_FILL = {
  MdA: 'FFFCE4D6',
  Gerty: 'FFDDEBF7',
  Bibliothèque: 'FFE2F0D9',
};
const ROOM_FILL = { 'Salle Haute': 'FFE4D1FF' };

// Time colours, one per start time, in the order the slots appear in the week
const TIME_COLORS = ['FF00B0F0', 'FF7030A0', 'FF0070C0', 'FFC00000', 'FFBF8F00', 'FF70AD47', 'FFED7D31'];

const roomFill = (room) => {
  if (!room) return null;
  if (ROOM_FILL[room.name]) return ROOM_FILL[room.name];
  return SITE_FILL[room.site] || null;
};

const solid = (color) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: color } });

// Colour of the start time: the same start time gets the same colour all week
const timeColors = (week) => {
  const starts = [...new Set(week.days.flatMap((d) => d.rows.map((r) => r.start)))].sort();
  return new Map(starts.map((s, i) => [s, TIME_COLORS[i % TIME_COLORS.length]]));
};

const COLUMNS = [
  { header: 'Jour', key: 'day', width: 14, band: HEADER.date },
  { header: 'Date', key: 'date', width: 12, band: HEADER.date },
  { header: 'Début', key: 'start', width: 9, band: HEADER.time },
  { header: 'Fin', key: 'end', width: 9, band: HEADER.time },
  { header: 'Élève', key: 'student', width: 16, band: HEADER.people },
  { header: 'Tuteur', key: 'tutor', width: 18, band: HEADER.people },
  { header: 'Matières', key: 'subjects', width: 22, band: HEADER.other },
  { header: 'Lieu', key: 'place', width: 26, band: HEADER.place },
  { header: 'Salle', key: 'room', width: 24, band: HEADER.room },
  { header: 'Type', key: 'kind', width: 18, band: HEADER.other },
  { header: 'Remarque', key: 'remark', width: 46, band: HEADER.other },
];

const roomCapacity = (week, roomId) => (week.rooms || []).find((x) => x.id === roomId)?.capacite ?? '?';

// Workbook with one sheet for the week; returns the file as a Blob
export const weekToXlsx = async (week) => {
  const wb = new ExcelJS.Workbook();
  wb.created = new Date();
  const ws = wb.addWorksheet('Planning');
  ws.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));

  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: 'FF000000' } };
  head.alignment = { vertical: 'middle' };
  COLUMNS.forEach((c, i) => {
    head.getCell(i + 1).fill = solid(c.band);
  });
  // The purple band wears white text, as on the sheet
  head.getCell(5).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  head.getCell(6).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  const times = timeColors(week);
  for (const d of week.days) {
    for (const r of d.rows) {
      const row = ws.addRow({
        day: d.day,
        date: d.date,
        start: r.start,
        end: r.end,
        student: r.student,
        tutor: r.tutor,
        subjects: (r.subjects || []).join(', '),
        place: r.remote ? 'À distance' : r.place,
        room: r.room_label || (r.needs_room ? 'À définir' : ''),
        kind: KIND_LABEL[r.kind] || '',
        remark: r.remark || '',
      });
      const isPause = r.kind === 'pause';
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', wrapText: false };
        if (isPause) cell.font = { strike: true, color: { argb: 'FF808080' } };
      });

      const startCell = row.getCell('start');
      startCell.font = { ...(startCell.font || {}), bold: true, color: { argb: times.get(r.start) } };
      if (isPause) startCell.font = { strike: true, color: { argb: 'FF808080' } };

      const roomCell = row.getCell('room');
      const fill = roomFill((week.rooms || []).find((x) => x.id === r.room_id));
      if (fill && !isPause) roomCell.fill = solid(fill);
      if (!r.room_id && r.needs_room) roomCell.font = { italic: true, color: { argb: 'FFC55A11' } };

      // Room conflict in red, alert threshold in orange, on the remark
      if (r.room_conflict || r.room_warning) {
        const remarkCell = row.getCell('remark');
        const color = r.room_conflict ? 'FFC00000' : 'FFED7D31';
        const prefix = `${r.room_count}/${roomCapacity(week, r.room_id)} · `;
        remarkCell.value = prefix + (r.remark || '');
        remarkCell.font = { bold: true, color: { argb: color } };
      }

      if (r.kind === 'supplementaire' || r.kind === 'remplacement') {
        row.getCell('kind').font = { bold: true, color: { argb: r.kind === 'remplacement' ? 'FFC55A11' : 'FF7030A0' } };
      }
    }
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const downloadBlob = (name, blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};


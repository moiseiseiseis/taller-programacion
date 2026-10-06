import fs from 'fs';
import path from 'path';
import { Document, Page, View, Text, Image, Font, StyleSheet } from '@react-pdf/renderer';

const FONTS_DIR = path.join(process.cwd(), 'src/lib/certificates/fonts');
const LOGO_PATH = path.join(process.cwd(), 'public/logos/logo_udg.png');
// @react-pdf/renderer no resuelve de forma confiable una ruta de archivo local
// como string (la trata como URL); leer el buffer directo evita eso.
const LOGO_BUFFER = fs.readFileSync(LOGO_PATH);

Font.register({
  family: 'Montserrat',
  fonts: [{ src: path.join(FONTS_DIR, 'Montserrat-Black.ttf'), fontWeight: 900 }],
});
Font.register({
  family: 'Lora',
  fonts: [
    { src: path.join(FONTS_DIR, 'Lora-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONTS_DIR, 'Lora-Bold.ttf'), fontWeight: 700 },
  ],
});
Font.register({
  family: 'JetBrains Mono',
  fonts: [{ src: path.join(FONTS_DIR, 'JetBrainsMono-Regular.ttf'), fontWeight: 400 }],
});

// El diseño se aprobó en un lienzo de 1056x816 px (96 dpi, Carta horizontal).
// El PDF usa puntos (72/in), así que todas las coordenadas del diseño se
// escalan por 0.75 (72/96) para mantener exactamente las mismas proporciones.
const SCALE = 0.75;
const px = (n: number) => n * SCALE;

const COLORS = {
  bg: '#14100D',
  panel: '#1A1613',
  panelBorder: '#322C25',
  mint: '#9BCCB1',
  steel: '#9DB6D3',
  red: '#D5615B',
  lightBlue: '#C2D3E4',
  cream: '#F5F1E7',
  bodyGray: '#C8C8C0',
  signatureLine: '#9C9C94',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.bg,
    fontFamily: 'Lora',
  },
  panel: {
    position: 'absolute',
    left: px(40),
    top: px(40),
    width: px(976),
    height: px(736),
    backgroundColor: COLORS.panel,
    border: `${px(3)}pt solid ${COLORS.panelBorder}`,
    borderRadius: px(36),
  },
  dot: {
    position: 'absolute',
    top: px(76),
    width: px(20),
    height: px(20),
    borderRadius: px(10),
  },
  wordmark: {
    position: 'absolute',
    left: px(76),
    top: px(104),
    width: px(520),
    fontSize: px(20),
    color: COLORS.mint,
    fontFamily: 'JetBrains Mono',
  },
  logoBox: {
    position: 'absolute',
    left: px(751),
    top: px(37),
    width: px(284),
    height: px(256),
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredRow: {
    position: 'absolute',
    left: px(128),
    width: px(800),
    textAlign: 'center',
  },
  mintLine: {
    position: 'absolute',
    left: px(268),
    top: px(350),
    width: px(520),
    height: px(2),
    backgroundColor: COLORS.mint,
  },
  signatureLine: {
    position: 'absolute',
    left: px(378),
    top: px(650),
    width: px(300),
    height: px(2),
    backgroundColor: COLORS.signatureLine,
  },
  signatureText: {
    position: 'absolute',
    left: px(378),
    top: px(660),
    width: px(300),
    fontSize: px(16),
    color: COLORS.bodyGray,
    textAlign: 'center',
    lineHeight: 1.4,
  },
  footerLeft: {
    position: 'absolute',
    left: px(76),
    top: px(738),
    width: px(300),
    fontSize: px(14),
    color: COLORS.steel,
    fontFamily: 'JetBrains Mono',
  },
  footerRight: {
    position: 'absolute',
    left: px(640),
    top: px(738),
    width: px(340),
    fontSize: px(14),
    color: COLORS.steel,
    fontFamily: 'JetBrains Mono',
    textAlign: 'right',
  },
});

export type CertificateData = {
  nombreAlumno: string;
  nombreTaller: string;
  folio: string;
  fechaEmision: string;
  nombreFirmante?: string;
  cargoFirmante?: string;
};

export default function CertificateDocument({
  nombreAlumno,
  nombreTaller,
  folio,
  fechaEmision,
  nombreFirmante = 'Dr. Carlos Jesahel Vega López',
  cargoFirmante = 'Director de Desarrollo Tecnológico e Ingenierías',
}: CertificateData) {
  const studentNameFontSize = nombreAlumno.length > 35 ? px(28) : nombreAlumno.length > 20 ? px(40) : px(56);

  // El nombre del taller varía mucho entre talleres; se achica con la
  // longitud para que, incluso el título más largo que existe hoy (47
  // caracteres, "Fundamentos de Computación..."), quepa en una sola línea
  // dentro de la caja de 600pt y no se encime con la leyenda de abajo.
  const workshopTitleFontSize = nombreTaller.length > 45 ? px(22) : nombreTaller.length > 25 ? px(28) : px(34);

  return (
    <Document>
      <Page size={{ width: px(1056), height: px(816) }} style={styles.page}>
        <View style={styles.panel} />

        <View style={[styles.dot, { left: px(76), backgroundColor: COLORS.red }]} />
        <View style={[styles.dot, { left: px(104), backgroundColor: COLORS.lightBlue }]} />
        <View style={[styles.dot, { left: px(132), backgroundColor: COLORS.mint }]} />

        <Text style={styles.wordmark}>~/futuros-programadores_</Text>

        <View style={styles.logoBox}>
          <Image src={{ data: LOGO_BUFFER, format: 'png' }} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </View>

        <Text style={[styles.centeredRow, { top: px(150), fontSize: px(18), color: COLORS.steel, fontFamily: 'JetBrains Mono' }]}>
          $ cat certificado.log
        </Text>

        <Text style={[styles.centeredRow, { top: px(184), fontSize: px(24), fontWeight: 700, color: COLORS.mint }]}>
          CERTIFICADO DE ACREDITACIÓN
        </Text>

        <Text style={[styles.centeredRow, { top: px(232), fontSize: px(18), color: COLORS.steel, fontFamily: 'JetBrains Mono' }]}>
          $ whoami
        </Text>

        <Text
          style={[
            styles.centeredRow,
            { top: px(256), fontSize: studentNameFontSize, fontWeight: 900, color: COLORS.cream, fontFamily: 'Montserrat' },
          ]}
        >
          {nombreAlumno}
        </Text>

        <View style={styles.mintLine} />

        <Text style={[styles.centeredRow, { top: px(366), fontSize: px(20), color: COLORS.bodyGray }]}>
          por haber aprobado el taller
        </Text>

        <Text style={[styles.centeredRow, { top: px(396), fontSize: workshopTitleFontSize, fontWeight: 900, color: COLORS.cream, fontFamily: 'Montserrat' }]}>
          {nombreTaller}
        </Text>

        <Text style={[styles.centeredRow, { top: px(452), fontSize: px(16), color: COLORS.bodyGray }]}>
          Por haber demostrado los conocimientos, destrezas y responsabilidad requeridos para la acreditación de este programa de formación
        </Text>

        <Text style={[styles.centeredRow, { top: px(540), fontSize: px(18), color: COLORS.steel }]}>
          División de Ingenierías
        </Text>

        <View style={styles.signatureLine} />
        <View style={styles.signatureText}>
          <Text>{nombreFirmante}</Text>
          <Text>{cargoFirmante}</Text>
        </View>

        <Text style={styles.footerLeft}>Folio: {folio}</Text>
        <Text style={styles.footerRight}>Fecha de emisión: {fechaEmision}</Text>
      </Page>
    </Document>
  );
}

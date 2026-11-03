import fs from 'fs';
import path from 'path';
import { Document, Page, View, Text, Image, Svg, Path, Font, StyleSheet } from '@react-pdf/renderer';

const FONTS_DIR = path.join(process.cwd(), 'src/lib/certificates/fonts');
const LOGOS_DIR = path.join(process.cwd(), 'public/logos');
const SIGNATURES_DIR = path.join(process.cwd(), 'public/signatures');

function readLogo(name: string) {
  return fs.readFileSync(path.join(LOGOS_DIR, name));
}

// Firma en imagen de cada firmante, si ya existe el archivo (ver instrucciones
// en el componente IssueCertificateForm / README de abajo). Mientras no
// exista, el certificado se ve igual que antes — solo la línea en blanco.
function readSignatureIfExists(fileName: string): Buffer | null {
  const filePath = path.join(SIGNATURES_DIR, fileName);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;
}

const LOGO_UDG = readLogo('cert-udg.png');
const LOGO_IEEE = readLogo('cert-ieee-cutlajo.png');
const LOGO_CUTLAJO = readLogo('cert-cutlajo-banner.png');

// Nombres de archivo esperados — colócalos en public/signatures/ (PNG, fondo
// transparente idealmente) y aparecen solos en el próximo certificado.
const SIGNATURE_VEGA_GOMEZ = readSignatureIfExists('vega-gomez.png');
const SIGNATURE_MORA_VENTURA = readSignatureIfExists('mora-ventura.png');

Font.register({
  family: 'Montserrat',
  fonts: [
    { src: path.join(FONTS_DIR, 'Montserrat-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONTS_DIR, 'Montserrat-Bold.ttf'), fontWeight: 700 },
  ],
});
Font.register({
  family: 'Alex Brush',
  fonts: [{ src: path.join(FONTS_DIR, 'AlexBrush-Regular.ttf'), fontWeight: 400 }],
});

// Certificado pensado para imprimirse: fondo blanco, nada de tema oscuro.
// Replica la plantilla física del director (banner azul con los 3 logos,
// ola celeste, "Reconocimiento" en script, y las dos firmas).
const NAVY = '#084c93';
const LIGHT_BLUE = '#b5e7fe';
const ACCENT_BLUE = '#1d6fae';
const INK = '#1a1a1a';
const GRAY_TEXT = '#4a4a4a';

const PAGE_W = 792; // Carta horizontal (11in @ 72pt/in)
const PAGE_H = 612;
const BANNER_H = 118;

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Montserrat',
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PAGE_W,
    height: BANNER_H,
    backgroundColor: NAVY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 45,
  },
  wave: {
    position: 'absolute',
    top: BANNER_H - 14,
    left: 0,
    width: PAGE_W,
    height: 26,
  },
  centered: {
    textAlign: 'center',
  },
});

function Laurel({ flip = false }: { flip?: boolean }) {
  // Rama de laurel sencilla: un tallo curvo con hojas (óvalos) a los lados,
  // igual a los que flanquean "Reconocimiento" en la plantilla física.
  const leaves = [0, 1, 2, 3, 4].map((i) => {
    const t = i / 4;
    const x = 18 - t * 14;
    const y = 4 + t * 46;
    const rotation = flip ? 35 - t * 20 : -35 + t * 20;
    return (
      <View
        key={i}
        style={{
          position: 'absolute',
          left: flip ? 36 - x - 7 : x - 7,
          top: y - 4,
          width: 14,
          height: 8,
          borderRadius: 7,
          backgroundColor: '#9a9a9a',
          transform: `rotate(${rotation}deg)`,
        }}
      />
    );
  });

  return (
    <View style={{ width: 36, height: 56, position: 'relative' }}>
      <Svg width={36} height={56} viewBox="0 0 36 56" style={{ position: 'absolute' }}>
        <Path
          d={flip ? 'M18 54 C 30 40, 30 16, 18 2' : 'M18 54 C 6 40, 6 16, 18 2'}
          stroke="#9a9a9a"
          strokeWidth={1.5}
          fill="none"
        />
      </Svg>
      {leaves}
    </View>
  );
}

export type CertificateData = {
  nombreAlumno: string;
  nombreTaller: string;
  realizadoFecha: string;
  lugar: string;
  duracionHoras: string;
  nombreFirmante?: string;
  cargoFirmante?: string;
  nombreFirmante2?: string;
  cargoFirmante2?: string;
};

export default function CertificateDocument({
  nombreAlumno,
  nombreTaller,
  realizadoFecha,
  lugar,
  duracionHoras,
  nombreFirmante = 'Dr. Carlos Jesahel Vega Gómez',
  cargoFirmante = 'Director de la División de Desarrollo Tecnológico e Ingenierías',
  nombreFirmante2 = 'Dr. Brhayllan Mora Ventura',
  cargoFirmante2 = 'Jefe del Departamento de Innovación Tecnológica',
}: CertificateData) {
  const studentNameFontSize = nombreAlumno.length > 35 ? 32 : nombreAlumno.length > 22 ? 40 : 48;
  const workshopTitleFontSize = nombreTaller.length > 45 ? 15 : 17;

  return (
    <Document>
      <Page size={{ width: PAGE_W, height: PAGE_H }} style={styles.page}>
        {/* Banner superior con los 3 logos */}
        <View style={styles.banner}>
          <Image src={LOGO_UDG} style={{ width: 183, height: 68 }} />
          <Image src={LOGO_IEEE} style={{ width: 163, height: 68 }} />
          <Image src={LOGO_CUTLAJO} style={{ width: 193, height: 68 }} />
        </View>

        {/* Ola celeste de transición entre el banner y el cuerpo blanco */}
        <Svg style={styles.wave} viewBox={`0 0 ${PAGE_W} 26`}>
          <Path
            d={`M0,8 C ${PAGE_W * 0.25},26 ${PAGE_W * 0.6},-6 ${PAGE_W},10 L${PAGE_W},26 L0,26 Z`}
            fill={LIGHT_BLUE}
          />
        </Svg>

        {/* Cuerpo */}
        <View style={{ position: 'absolute', top: 148, left: 40, width: PAGE_W - 80 }}>
          <Text style={[styles.centered, { fontSize: 15, fontWeight: 700, color: INK, letterSpacing: 2 }]}>
            OTORGA EL PRESENTE
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6 }}>
            <Laurel />
            <Text style={{ fontFamily: 'Alex Brush', fontSize: 46, color: ACCENT_BLUE, marginHorizontal: 14 }}>
              Reconocimiento
            </Text>
            <Laurel flip />
          </View>

          <Text style={[styles.centered, { fontSize: 14, color: GRAY_TEXT, marginTop: 2 }]}>A:</Text>

          <Text
            style={[
              styles.centered,
              { fontFamily: 'Alex Brush', fontSize: studentNameFontSize, color: INK, marginTop: 8 },
            ]}
          >
            {nombreAlumno}
          </Text>
          <View style={{ width: 360, height: 1, backgroundColor: NAVY, alignSelf: 'center', marginTop: 2, marginBottom: 14 }} />

          <Text style={[styles.centered, { fontSize: 13, color: GRAY_TEXT }]}>
            Por su participación y aprovechamiento en el
          </Text>
          <Text style={[styles.centered, { fontSize: workshopTitleFontSize, fontWeight: 700, color: INK, marginTop: 4 }]}>
            {nombreTaller}
          </Text>

          <Text style={[styles.centered, { fontSize: 13, color: GRAY_TEXT, marginTop: 12, lineHeight: 1.4 }]}>
            Realizado el día {realizadoFecha}, en {lugar}, con una duración de {duracionHoras} hrs
          </Text>
        </View>

        {/* Firmas */}
        <View style={{ position: 'absolute', bottom: 55, left: 0, width: PAGE_W, flexDirection: 'row', justifyContent: 'center' }}>
          <View style={{ width: 300, marginHorizontal: 20 }}>
            {SIGNATURE_VEGA_GOMEZ && (
              <Image src={SIGNATURE_VEGA_GOMEZ} style={{ width: 140, height: 42, alignSelf: 'center', marginBottom: -8 }} />
            )}
            <View style={{ borderTopWidth: 1, borderTopColor: INK, paddingTop: 6 }}>
              <Text style={[styles.centered, { fontSize: 12, fontWeight: 700, color: INK }]}>{nombreFirmante}</Text>
              <Text style={[styles.centered, { fontSize: 10, color: GRAY_TEXT, marginTop: 2, lineHeight: 1.3 }]}>
                {cargoFirmante}
              </Text>
            </View>
          </View>
          <View style={{ width: 300, marginHorizontal: 20 }}>
            {SIGNATURE_MORA_VENTURA && (
              <Image src={SIGNATURE_MORA_VENTURA} style={{ width: 140, height: 42, alignSelf: 'center', marginBottom: -8 }} />
            )}
            <View style={{ borderTopWidth: 1, borderTopColor: INK, paddingTop: 6 }}>
              <Text style={[styles.centered, { fontSize: 12, fontWeight: 700, color: INK }]}>{nombreFirmante2}</Text>
              <Text style={[styles.centered, { fontSize: 10, color: GRAY_TEXT, marginTop: 2, lineHeight: 1.3 }]}>
                {cargoFirmante2}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

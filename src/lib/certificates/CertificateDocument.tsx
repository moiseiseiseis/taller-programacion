import fs from 'fs';
import path from 'path';
import { Document, Page, View, Text, Image, Svg, Path, Circle, Font, StyleSheet } from '@react-pdf/renderer';

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
// Basado en la plantilla física del director (banner azul con los 3 logos,
// ola celeste, "Reconocimiento" en script, las dos firmas) más un marco
// ornamental, florituras en las esquinas y un sello entre las firmas.
const NAVY = '#084c93';
const LIGHT_BLUE = '#b5e7fe';
const ACCENT_BLUE = '#1d6fae';
const INK = '#1a1a1a';
const GRAY_TEXT = '#4a4a4a';
const GOLD = '#b3882a';

const PAGE_W = 792; // Carta horizontal (11in @ 72pt/in)
const PAGE_H = 612;
const BANNER_H = 118;

const FRAME_LEFT = 22;
const FRAME_RIGHT = PAGE_W - 22;
const FRAME_TOP = BANNER_H + 16;
const FRAME_BOTTOM = PAGE_H - 22;

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
  // Rama de laurel: tallo curvo con hojas a los lados, flanqueando
  // "Reconocimiento" igual que en la plantilla física.
  const leaves = [0, 1, 2, 3, 4, 5].map((i) => {
    const t = i / 5;
    const x = 20 - t * 16;
    const y = 2 + t * 54;
    const scale = 1 - t * 0.35;
    const rotation = flip ? 38 - t * 22 : -38 + t * 22;
    return (
      <View
        key={i}
        style={{
          position: 'absolute',
          left: (flip ? 40 - x - 8 : x - 8) ,
          top: y - 4.5,
          width: 16 * scale,
          height: 9 * scale,
          borderRadius: 7,
          backgroundColor: '#9a9a9a',
          transform: `rotate(${rotation}deg)`,
        }}
      />
    );
  });

  return (
    <View style={{ width: 40, height: 62, position: 'relative' }}>
      <Svg width={40} height={62} viewBox="0 0 40 62" style={{ position: 'absolute' }}>
        <Path
          d={flip ? 'M20 60 C 34 44, 34 18, 20 2' : 'M20 60 C 6 44, 6 18, 20 2'}
          stroke="#9a9a9a"
          strokeWidth={1.5}
          fill="none"
        />
      </Svg>
      {leaves}
    </View>
  );
}

// Floritura de esquina: un tallo con un pequeño remolino al final. Se dibuja
// una sola vez para la esquina superior izquierda y se refleja con
// transform para las otras tres.
function CornerFlourish({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const transform =
    corner === 'tr' ? 'scaleX(-1)' : corner === 'bl' ? 'scaleY(-1)' : corner === 'br' ? 'scale(-1, -1)' : undefined;
  const pos =
    corner === 'tl'
      ? { left: FRAME_LEFT - 7, top: FRAME_TOP - 7 }
      : corner === 'tr'
        ? { left: FRAME_RIGHT - 31, top: FRAME_TOP - 7 }
        : corner === 'bl'
          ? { left: FRAME_LEFT - 7, top: FRAME_BOTTOM - 31 }
          : { left: FRAME_RIGHT - 31, top: FRAME_BOTTOM - 31 };

  return (
    <View style={{ position: 'absolute', width: 38, height: 38, ...pos, transform }}>
      <Svg width={38} height={38} viewBox="0 0 38 38">
        <Path
          d="M2,2 C2,16 6,26 18,30 C24,32 29,30 33,25"
          stroke={NAVY}
          strokeWidth={1.4}
          fill="none"
        />
        <Path d="M2,2 C2,10 4,16 9,20" stroke={LIGHT_BLUE} strokeWidth={1.2} fill="none" />
        <Circle cx={33} cy={25} r={2.2} fill={GOLD} />
        <Circle cx={2} cy={2} r={2.6} fill={NAVY} />
      </Svg>
    </View>
  );
}

// Sello/medalla decorativa centrada arriba de las firmas: una roseta con
// listones colgando, como un sello de reconocimiento clásico. Cada pétalo
// se posiciona con trigonometría (en vez de transform-origin, que no todos
// los visores de PDF respetan igual) para que quede un círculo parejo.
function Seal() {
  const CENTER = 23;
  const RADIUS = 15;
  const petals = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 360) / 12;
    const rad = (angle * Math.PI) / 180;
    const cx = CENTER + RADIUS * Math.sin(rad);
    const cy = CENTER - RADIUS * Math.cos(rad);
    return (
      <View
        key={i}
        style={{
          position: 'absolute',
          left: cx - 3.5,
          top: cy - 6,
          width: 7,
          height: 12,
          borderRadius: 3.5,
          backgroundColor: LIGHT_BLUE,
          transform: `rotate(${angle}deg)`,
        }}
      />
    );
  });

  return (
    <View style={{ width: 46, height: 62, position: 'relative' }}>
      {/* listones */}
      <Svg width={46} height={62} viewBox="0 0 46 62" style={{ position: 'absolute' }}>
        <Path d="M16,34 L10,60 L23,51 Z" fill={NAVY} />
        <Path d="M30,34 L36,60 L23,51 Z" fill={ACCENT_BLUE} />
      </Svg>
      {/* roseta */}
      <View style={{ position: 'absolute', left: 0, top: 0, width: 46, height: 46 }}>{petals}</View>
      <View
        style={{
          position: 'absolute',
          left: 5,
          top: 5,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: NAVY,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: 27, height: 27, borderRadius: 14, borderWidth: 1.2, borderColor: GOLD }} />
      </View>
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
  const studentNameFontSize = nombreAlumno.length > 35 ? 38 : nombreAlumno.length > 22 ? 48 : 58;
  const workshopTitleFontSize = nombreTaller.length > 45 ? 18 : 20;

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

        {/* Marco ornamental doble alrededor del cuerpo */}
        <Svg
          style={{ position: 'absolute', left: 0, top: 0, width: PAGE_W, height: PAGE_H }}
          viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
        >
          <Path
            d={`M${FRAME_LEFT},${FRAME_TOP} H${FRAME_RIGHT} V${FRAME_BOTTOM} H${FRAME_LEFT} Z`}
            stroke={NAVY}
            strokeWidth={1.4}
            fill="none"
          />
          <Path
            d={`M${FRAME_LEFT + 6},${FRAME_TOP + 6} H${FRAME_RIGHT - 6} V${FRAME_BOTTOM - 6} H${FRAME_LEFT + 6} Z`}
            stroke={LIGHT_BLUE}
            strokeWidth={0.9}
            fill="none"
          />
        </Svg>
        <CornerFlourish corner="tl" />
        <CornerFlourish corner="tr" />
        <CornerFlourish corner="bl" />
        <CornerFlourish corner="br" />

        {/* Cuerpo */}
        <View style={{ position: 'absolute', top: 152, left: 40, width: PAGE_W - 80 }}>
          <Text style={[styles.centered, { fontSize: 18, fontWeight: 700, color: INK, letterSpacing: 2.5 }]}>
            OTORGA EL PRESENTE
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
            <Laurel />
            <Text style={{ fontFamily: 'Alex Brush', fontSize: 58, color: ACCENT_BLUE, marginHorizontal: 16 }}>
              Reconocimiento
            </Text>
            <Laurel flip />
          </View>

          <Text style={[styles.centered, { fontSize: 17, color: GRAY_TEXT, marginTop: 2 }]}>A:</Text>

          <Text
            style={[
              styles.centered,
              { fontFamily: 'Alex Brush', fontSize: studentNameFontSize, color: INK, marginTop: 6 },
            ]}
          >
            {nombreAlumno}
          </Text>
          <View style={{ width: 380, height: 1, backgroundColor: NAVY, alignSelf: 'center', marginTop: 2, marginBottom: 12 }} />

          <Text style={[styles.centered, { fontSize: 16, color: GRAY_TEXT }]}>
            Por su participación y aprovechamiento en el
          </Text>
          <Text style={[styles.centered, { fontSize: workshopTitleFontSize, fontWeight: 700, color: INK, marginTop: 4 }]}>
            {nombreTaller}
          </Text>

          <Text style={[styles.centered, { fontSize: 15, color: GRAY_TEXT, marginTop: 10, lineHeight: 1.4 }]}>
            Realizado el día {realizadoFecha}, en {lugar}, con una duración de {duracionHoras} hrs
          </Text>
        </View>

        {/* Sello, arriba de las firmas */}
        <View style={{ position: 'absolute', bottom: 102, left: 0, width: PAGE_W, alignItems: 'center' }}>
          <Seal />
        </View>

        {/* Firmas */}
        <View style={{ position: 'absolute', bottom: 58, left: 0, width: PAGE_W, flexDirection: 'row', justifyContent: 'center' }}>
          <View style={{ width: 300, marginHorizontal: 44 }}>
            {SIGNATURE_VEGA_GOMEZ && (
              <Image src={SIGNATURE_VEGA_GOMEZ} style={{ width: 140, height: 42, alignSelf: 'center', marginBottom: -8 }} />
            )}
            <View style={{ borderTopWidth: 1, borderTopColor: INK, paddingTop: 6 }}>
              <Text style={[styles.centered, { fontSize: 14, fontWeight: 700, color: INK }]}>{nombreFirmante}</Text>
              <Text style={[styles.centered, { fontSize: 12, color: GRAY_TEXT, marginTop: 2, lineHeight: 1.3 }]}>
                {cargoFirmante}
              </Text>
            </View>
          </View>
          <View style={{ width: 300, marginHorizontal: 44 }}>
            {SIGNATURE_MORA_VENTURA && (
              <Image src={SIGNATURE_MORA_VENTURA} style={{ width: 140, height: 42, alignSelf: 'center', marginBottom: -8 }} />
            )}
            <View style={{ borderTopWidth: 1, borderTopColor: INK, paddingTop: 6 }}>
              <Text style={[styles.centered, { fontSize: 14, fontWeight: 700, color: INK }]}>{nombreFirmante2}</Text>
              <Text style={[styles.centered, { fontSize: 12, color: GRAY_TEXT, marginTop: 2, lineHeight: 1.3 }]}>
                {cargoFirmante2}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

/*
// Fingerprint for demo URL, expires on June 2, 2021, needs to be updated well before this date
const uint8_t fingerprint[20] = {0xea, 0x2d, 0x8d, 0x23, 0x42, 0xb5, 0xa2, 0xd8, 0xaf, 0x2d, 0x41, 0xd4, 0x0b, 0xa2, 0x3b, 0x69, 0xe5, 0x32, 0xd7, 0x53};

 * 57:D0:3C:B9:DE:29:B9:9C:B1:3C:48:4B:50:71:68:09:6A:CD:2C:17
static const char kFirebaseFingerprint[] =
      "6F D0 9A 52 C0 E9 E4 CD A0 D3 02 A4 B7 A1 92 38 2D CA 2F 26";
*/

String URL = "https://firestore.googleapis.com/v1beta1/projects/cookie-jar-c7a3a/databases/(default)/documents/machines/o5AkuMpP2Vb2bpQvGx70";


#define D0 16
#define D1 5
#define D2 4
#define D3 0
#define D4 2
#define D5 14
#define D6 12
#define D7 13
#define D8 15
#define RX 3
#define TX 1
#define SD2 10
#define SD3 9

#define CYCLE_PULSES 200
#define MOTOR_SPEED 1500

#define SSID "BenSassons2.4"
#define PASSWORD "k7p23txr"

#define ACTION "actionType"
#define ACTION_PUT "put"
#define ACTION_GET "get"

#define DESIRED_CYCLES "cycles"
#define DESIRED_HELIX "HelixIndex"
#define VERSION "$version"
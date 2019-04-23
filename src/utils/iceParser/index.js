/**
 * @argument {candidate-attribute}                                = "candidate" ":" foundation SP component-id SP
                                                                  transport SP
                                                                  priority SP
                                                                  connection-address SP     ;from RFC 4566
                                                                  port         ;port from RFC 4566
                                                                  SP cand-type
                                                                  [SP rel-addr]
                                                                  [SP rel-port]
                                                                  *(SP extension-att-name SP
                                                                        extension-att-value)

 * @argument {foundation}                                         = 1*32ice-char is composed of 1 to 32 <ice-char>s.  It is an
                                                                  identifier that is equivalent for two candidates that are of the
                                                                  same type, share the same base, and come from the same STUN
                                                                  server.  The foundation is used to optimize ICE performance in the
                                                                  Frozen algorithm.
 * @argument {transport}                                          = "UDP" / transport-extension
 * @argument {transport-extension}                                = token
 * @argument {priority}                                           = 1*10DIGIT is a positive integer between 1 and (2**31 - 1)
 * @argument {cand-type}                                          = "typ" SP candidate-types
 * @argument {candidate-types}                                    = "host" / "srflx" / "prflx" / "relay" / token
 * @argument {rel-addr}                                           = "raddr" SP connection-address
 * @argument {rel-port}                                           = "rport" SP port
 * @argument {extension-att-name}                                 = byte-string
 * @argument {extension-att-value}                                = byte-string
 * @argument {ice-char}                                           = ALPHA / DIGIT / "+" / "/"
 * @argument {connection-address}
 * @argument {port}
 */

// candidate:1980850359 1 udp 2122260223 192.168.1.108 51142 typ host generation 0 ufrag WVsP network-id 1
// candidate:1980850359 1 udp 2122260223 192.168.1.108 59656 typ host generation 0 ufrag WVsP network-id 1
// candidate:4149831171 1 udp 1686052607 42.229.12.78 18352 typ srflx raddr 192.168.1.108 rport 59656 generation 0 ufrag WVsP network-id 1
// candidate:949132359 1 tcp 1518280447 192.168.1.108 9 typ host tcptype active generation 0 ufrag WVsP network-id 1
// candidate:949132359 1 tcp 1518280447 192.168.1.108 9 typ host tcptype active generation 0 ufrag WVsP network-id 1
// candidate:4149831171 1 udp 1686052607 42.229.12.78 18351 typ srflx raddr 192.168.1.108 rport 51142 generation 0 ufrag WVsP network-id 1
const params = ['foundation', 'componentID', 'transport', 'priority', 'address', 'port'];
const candidateStr = 'candidate:';

function iceParser(ice, parsePriority = false) {
  const output = {};
  const pos = ice.indexOf(candidateStr) + candidateStr.length;
  const cArray = ice.substr(pos).split(' ');

  for(let i=0;i<6;i++) {
    output[params[i]] = cArray[i];
  }
  if (parsePriority) output['priority'] = formatPriority(output['priority']);
  for(let i=6;i<cArray.length;i++) {
    if (i%2 !== 0) continue;
    output[cArray[i]] = cArray[i+1];
  }
  return output;
}

// Parse the uint32 PRIORITY field into its constituent parts from RFC 5245,
// type preference, local preference, and (256 - component ID).
// ex: 126 | 32252 | 255 (126 is host preference, 255 is component ID 1)
function formatPriority(priority) {
  return [
    priority >> 24,
    (priority >> 8) & 0xFFFF,
    priority & 0xFF
  ];
}

export default iceParser;

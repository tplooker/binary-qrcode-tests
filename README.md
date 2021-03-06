# Encoding binary data in QR Codes

The landscape of QR codes is complex, with many different standards and encoding schemes, there is a variety of guidance as to how to appropriately use these for encoding different types of data. This repository is home to a set of tests aimed at exploring the most appropriate way to encode raw binary into a QR code.

The main character encoding modes supported by QR codes are the following ([table copied from here](https://raw.githubusercontent.com/soldair/node-qrcode/master/README.md))

| Mode         | Characters                                                 | Compression                               |
| ------------ | ---------------------------------------------------------- | ----------------------------------------- |
| Numeric      | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9                               | 3 characters are represented by 10 bits   |
| Alphanumeric | 0–9, A–Z (upper-case only), space, $, %, \*, +, -, ., /, : | 2 characters are represented by 11 bits   |
| Kanji        | Characters from the Shift JIS system based on JIS X 0208   | 2 kanji are represented by 13 bits        |
| Byte         | Characters from the ISO/IEC 8859-1 character set           | Each characters are represented by 8 bits |

# The problem

From the chart above the solution seems simple? Just use byte encoding. However the problem with this approach is that most QR code readers reading a QR code encoded in the 'byte' mode will actually process the bytes in the context of the ISO 8859-1 character set, which [actually only supports a subset of values](https://en.wikipedia.org/wiki/ISO/IEC_8859-1#Code_page_layout) that a single byte can represent. This means a QR code that encodes raw binary not conforming to ISO 8859-1 wont reliably be read by QR code readers
as they will often stop reading when they encounter a unsupported character, or alternatively not expose the ability to simply get the "raw bytes" encoded into a QR code.

# Possible solutions

1. Encode in 'byte' mode with raw binary, only support readers that do not enforce ISO/IEC 8859-1 character encoding
   Pro's - The most concise encoding of raw binary data
   Con's - Difficulties with QR code readers that assume ISO/IEC 8859-1, there is also an inability to easily encode data in a way that can be formatted as a URI to support deep linking from outside of an application context.
2. Encode in 'byte' mode with base64 encoded content
   Pro's - Supported by all QR code readers as it avoids collision with ISO/IEC 8859-1
   Con's - Not very efficient, base64 is a 6 bit encoding scheme and the QR code 'byte' mode encoding is 8 bit, this means 2 bits of every byte in the encoded data wont be used. Leading to about 25% bloat in payload size
3. Encode in 'alphanumeric' mode with upper-cased base32 content.
   Pro's - Second most efficient encoding of raw binary data as base32 is 5 bits and the QR code `alphanumeric` mode is a 5.5 bit encoding format (i.e 11 bits to every two bytes), information is also in text form suitable for URI formatting for deep linking
   Con's slightly less efficient that raw binary ~ .5 bit per byte (6.25%).

In summary dependent on requirements, option 1 is the most concise, however option 3 offers the best tradeoffs in terms of broad QR code reader support and URI encode-ability whilst paying a 6.25% cost in size overhead.

// export const mailConfig = {
//   host: "mail.smtp2go.com",
//   port: 465,
//   secure: true, // true for 465, false for other ports
//   logger: false,
//   debug: false,
//   secureConnection: false,
//   auth: {
//     user: "rahul_baghel@seologistics.com",
//     pass: "fkVDAtiEizC14dde",
//   },
//   tls: {
//     rejectUnAuthorized: true,
//   },
// }


export const mailConfig = {
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT as string),
  secure: false, // true for 465, false for other ports
  logger: false,
  debug: false,
  secureConnection: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnAuthorized: true,
  },
};

// mail/bookingConfirmation.mail.ts
import { transporter } from "./transporter.mail";
import ejs from "ejs";
import path from "path";
import { IBooking } from "../interfaces/booking/booking.interface";

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const sendBookingConfirmationMail = async (booking: IBooking) => {
  try {
    // Template data
    const templateData = {
      booking,
      formatDate,
      hotelName: "Your Hotel Name",
      hotelLogo: "https://res-console.cloudinary.com/dh187xay8/media_explorer_thumbnails/d7fe33f23e138c61f374b7be251c7cdd/detailed",
      confirmationIcon: "https://res-console.cloudinary.com/dh187xay8/media_explorer_thumbnails/156fae2e26b248bc3022c39937a67c81/detailed",
      socialLinks: {
        facebook: "https://facebook.com/yourhotel",
        // twitter: "https://twitter.com/yourhotel",
        instagram: "https://instagram.com/yourhotel"
      },
      socialIcons: {
        facebook: "https://placeholder.com/facebook.png",
        // twitter: "https://placeholder.com/twitter.png",
        instagram: "https://placeholder.com/instagram.png"
      }
    };

    // Render email template
    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "../views/booking/bookingConfirmationTemplate.ejs"),
      templateData
    );

    // Email options
    const mailOptions = {
      from: process.env.MAIL_FROM || "bookings@yourhotel.com",
      to: booking.guestDetails.email,
      subject: `Booking Confirmation - ${booking.bookingNumber}`,
      html: htmlContent
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${booking.guestDetails.email}`);
    return true;
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return false;
  }
};
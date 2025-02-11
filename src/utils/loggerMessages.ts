// utils/loggerMessages.ts
export const LoggerMessages = {
    BOOKING: {
      CREATE: {
        START: 'Starting booking creation process',
        SUCCESS: 'Booking created successfully',
        FAIL: 'Failed to create booking',
      },
      NOTIFICATION: {
        EMAIL: {
          START: 'Sending booking confirmation email',
          SUCCESS: 'Booking confirmation email sent successfully',
          FAIL: 'Failed to send booking confirmation email',
        },
        SMS: {
          START: 'Sending booking confirmation SMS',
          SUCCESS: 'Booking confirmation SMS sent successfully',
          FAIL: 'Failed to send booking confirmation SMS',
        }
      },
      VALIDATION: {
        START: 'Validating booking data',
        FAIL: 'Booking validation failed',
      },
      PAYMENT: {
        START: 'Processing payment',
        SUCCESS: 'Payment processed successfully',
        FAIL: 'Payment processing failed',
      }
    },
    USER: {
      AUTH: {
        LOGIN: {
          START: 'User login attempt',
          SUCCESS: 'User logged in successfully',
          FAIL: 'Login failed',
        },
        LOGOUT: {
          SUCCESS: 'User logged out successfully',
        }
      }
    },
    SYSTEM: {
      STARTUP: 'System starting up',
      SHUTDOWN: 'System shutting down',
      ERROR: 'System error occurred',
    }
  };
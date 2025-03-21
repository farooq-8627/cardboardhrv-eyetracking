# CardboardHRV: Cost-Effective Heart Rate Variability Monitoring System

CardboardHRV is a web-based application that enables real-time heart rate variability (HRV) monitoring using a smartphone's camera with optical fiber attachment. The system provides professional-grade analysis for researchers and individuals.

## Features

- Real-time HRV monitoring through smartphone camera
- Advanced eye tracking capabilities
- Pupil diameter analysis
- WebSocket-based real-time data streaming
- Comprehensive HRV metrics calculation
- Modern, responsive user interface
- Secure data storage with Supabase

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- A smartphone with a camera
- Optical fiber attachment (for PPG signal acquisition)

## Project Structure

```
cardboardhrv/
├── app/                    # Next.js application pages
├── components/            # React components
├── lib/                   # Utility functions and services
├── backend/              # Python FastAPI backend
│   ├── main.py          # WebSocket and HRV processing
│   └── requirements.txt  # Python dependencies
└── public/               # Static assets
```

## Setup Instructions

### Frontend Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file with your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Create a Python virtual environment:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```bash
   python main.py
   ```

## Usage

1. Access the web application at `http://localhost:3000`
2. Navigate to the "Live Monitor" page
3. Connect your smartphone and ensure it's on the same network
4. Attach the optical fiber to your smartphone's camera
5. Position the optical fiber on your forehead
6. Click "Start Stream" to begin monitoring

## HRV Metrics

The system calculates the following HRV metrics in real-time:

- Heart Rate (bpm)
- RR Intervals (ms)
- SDNN (ms)
- RMSSD (ms)
- pNN50 (%)
- LF/HF Ratio

## Development

### Frontend Development

The frontend is built with:

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- WebSocket for real-time communication

### Backend Development

The backend uses:

- FastAPI
- OpenCV for image processing
- NumPy for signal processing
- WebSocket for real-time data streaming

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

Based on the research paper:
"CardboardHRV: Bridging Virtual Reality and Biofeedback with a Cost-Effective Heart Rate Variability System"

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

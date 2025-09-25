#!/usr/bin/env python3
try:
    from reportlab.pdfgen import canvas
    print("reportlab available")
except ImportError:
    print("reportlab not available")

try:
    from fpdf import FPDF
    print("fpdf available")
except ImportError:
    print("fpdf not available")

try:
    import pdfkit
    print("pdfkit available")
except ImportError:
    print("pdfkit not available")
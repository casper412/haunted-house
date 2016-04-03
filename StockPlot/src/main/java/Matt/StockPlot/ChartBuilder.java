package Matt.StockPlot;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.imageio.ImageIO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ChartBuilder {
	private static final Logger LOG = LoggerFactory.getLogger(ChartBuilder.class);
	
	public enum ChartFormat {
		DOT, LINE
	}

	private List<String> dataSetNames = new ArrayList<String>();
	private List<ChartFormat> dataSetFormats = new ArrayList<ChartFormat>();
	private List<Color> dataSetColors = new ArrayList<Color>();
	private List<Date> categories = new ArrayList<Date>();
	private List<Double[]> values = new ArrayList<Double[]>();

	private double ymin = -1.0;
	private double ymax = -1.0;
	private double yminor = 5.0;
	private double ymajor = 25.0;
	private int xmajor = 3;
	
	int minx = 50;
	int miny = 0;
	int maxx = 2028;
	int maxy = 930;
	int width = 2048;
	int height = 1024;
	
	private int LARGE_DOT = 6;
	private int SMALL_DOT = 4;
	
	public void addDataset(String name, ChartFormat format, Color c) {
		dataSetNames.add(name);
		dataSetFormats.add(format);
		dataSetColors.add(c);
	}

	public void addValue(Date date, Double... recordValues) {
		categories.add(date);
		values.add(recordValues);
		// Track extents
		for (Double value : recordValues) {
			if (ymin < 0. || ymin > value) {
				ymin = value;
			}
			if (ymax < 0. || ymax < value) {
				ymax = value;
			}
		}
	}

	public void output(String outFile) throws IOException {
		BufferedImage bi = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
		Graphics2D g2 = bi.createGraphics();
		//Antialiasing
		g2.translate(0.5, 0.5);
		RenderingHints rh = new RenderingHints(
	             RenderingHints.KEY_TEXT_ANTIALIASING,
	             RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
	    g2.setRenderingHints(rh);
	    //Draw everything
		drawBackground(g2, width, height);
		drawAxis(g2, categories, ymin, ymax, ymajor, yminor, width, height);
		drawYGrid(g2);
		drawCategories(g2);
		for (int i = 0; i < dataSetNames.size(); i++) {
			drawDataSet(g2, i);
		}
		ImageIO.write(bi, "PNG", new File(outFile));
	}

	private void drawDataSet(Graphics2D g2, int dataset) {
		int i = 0;
		g2.setColor(dataSetColors.get(dataset));
		switch (dataSetFormats.get(dataset)) {
			case DOT:
				int halfLDot = LARGE_DOT / 2;
				for (Double[] row : values) {
					Double value = row[dataset];
					int x = convertX(i);
					int y = convertY(value);
					g2.fillOval(x - halfLDot, y - halfLDot, LARGE_DOT, LARGE_DOT);
					i++;
				}
			break; case LINE:
				int lastX = -1;
				int lastY = -1;
				int halfSDot = SMALL_DOT / 2;
				for (Double[] row : values) {
					Double value = row[dataset];
					int x = convertX(i);
					int y = convertY(value);
					if (lastX >= 0) {
						g2.drawLine(lastX, lastY, x, y);
					}
					g2.fillRect(x - halfSDot, y - halfSDot, SMALL_DOT, SMALL_DOT);
					lastX = x;
					lastY = y;
					i++;
				}
			break;
		}
	}
	
	private void drawCategories(Graphics2D g2) {
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
		AffineTransform orig = g2.getTransform();
		
		//Set up font
		Font font = new Font("TimesRoman", Font.BOLD, 14);
		g2.setFont(font);
		g2.setPaint(Color.BLACK);
		
		FontMetrics fontMetrics = g2.getFontMetrics();
		int stringHeight = fontMetrics.getAscent();
		
		int i = 0;
		for (Date category : categories) {
			if (i % xmajor == 0) {
				g2.setTransform(orig);
				//Center on X and 75% down the white space at the bottom
				g2.translate(convertX(i) + (stringHeight / 2), ((height - maxy) * 0.75) + maxy);
				g2.rotate(-Math.PI/2);
				
				g2.drawString(df.format(category), 0, 0);
			}
			i++;
		}
		g2.setTransform(orig);
	}
	
	private void drawYGrid(Graphics2D g2) {
		Double start = ymin;
		//Major lines
		Font font = new Font("TimesRoman", Font.BOLD, 14);
		g2.setFont(font);
		while (start < ymax) {
			int y = convertY(start);
			//LOG.debug(y + " - ");
			g2.setColor(Color.GRAY);
			g2.drawLine(0, y, width, y);
			g2.setColor(Color.BLACK);
			drawText(g2, start, 4, y);
			//Place the text
			start += ymajor;
		}
		
		start = ymin;
		//Minor lines
		g2.setColor(Color.GRAY);
		while (start < ymax) {
			int y = convertY(start);
			LOG.debug(y + " - ");
			g2.drawLine(minx - 1, y, minx + 3, y);
			start += yminor;
		}
	}
	
	private void drawText(Graphics2D g2, Double value, int x, int y) {
		DecimalFormat df = new DecimalFormat("0.00");
		String message = df.format(value);
		g2.setPaint(Color.black);
		g2.drawString(message, x, y);
	}
	
	private int convertX(int category) {
		double catRange = categories.size();
		double range = category / catRange;
		return ((int)((maxx - minx) * range)) + ((int)(minx * 1.5));
	}
	
	private int convertY(Double value) {
		double range = (value - ymin) / (ymax - ymin);
		return maxy - ((int)((int)((double)(maxy - miny)) * range));
	}
	
	private void drawAxis(Graphics2D g2, List<Date> categories2, Double ymin2, Double ymax2, Double ymajor2,
			Double yminor2, int width, int height) {
		g2.setColor(Color.GRAY);
		g2.drawLine(minx, 0, minx, height); //Y Axis
		g2.drawLine(0, maxy, width, maxy);	//X Axis
	}

	private void drawBackground(Graphics2D g2, int width, int height) {
		g2.setColor(Color.WHITE);
		g2.fillRect(0, 0, width, height);
	}
}

package Matt.StockPlot;

import java.awt.Color;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import Matt.StockPlot.ChartBuilder.ChartFormat;

@Component
class MarketAnalyzer {

	private static final Logger LOG = LoggerFactory.getLogger(MarketAnalyzer.class);

	private static final int LOOKBACK = 20;
	
	private static final int CHART_DATA = 200;
	
	private static final int TRUE_RANGE_BUFFER = 1;
	private static final int MOVING_AVG_1 = 10;
	private static final int MOVING_AVG_2 = 26;
	
	public void run(String dataFile) throws IOException, ParseException {
		List<MarketRecord> records = parse(dataFile);
		List<MarketAnalysis> results = new ArrayList<MarketAnalysis>();
		for (MarketRecord record : records) {
			results.add(analyze(record, results));
		}
		output("./out.csv", results);
		outputPNG("./out.png", results);
	}
	/**
	 * Write out a CSV and a PNG with the results
	 * @param outFile
	 * @param results
	 * @throws IOException
	 */
	private void output(String outFile, List<MarketAnalysis> results) throws IOException {
		FileWriter writer = new FileWriter(outFile);
		final CSVPrinter printer = CSVFormat.DEFAULT
				.withHeader("Date", "Close", "WARN", "MVG1", "MVG2",
						"DevStop1", "DevStop2", "DevStop3")
				.print(writer);
		for (MarketAnalysis result : results) {
			List<Object> record = new ArrayList<>();
			record.add(result.getData().getDate());
			record.add(result.getData().getClose());
			//record.add(result.getTrueRange());
			//Flip
			record.add(result.getMovingAvg1());
			record.add(result.getMovingAvg2());
			//Data
			record.add(result.getWarn());
			record.add(result.getDevStop1());
			record.add(result.getDevStop2());
			record.add(result.getDevStop3());
			LOG.debug(result.toString());
			printer.printRecord(record);
		}
		printer.close();
	}
	/**
	 * Write out a PNG using ChartBuilder
	 * @param outFile
	 * @param results
	 * @throws IOException
	 */
	private void outputPNG(String outFile, List<MarketAnalysis> results) throws IOException {
		ChartBuilder builder = new ChartBuilder();
		builder.addDataset("Close", ChartFormat.LINE, Color.BLUE);
		//builder.addDataset("Low", ChartFormat.LINE, Color.GREEN);
		//builder.addDataset("High", ChartFormat.LINE, Color.GRAY);
		builder.addDataset("Warn", ChartFormat.DOT, new Color(215, 223, 1));
		builder.addDataset("DevStop1", ChartFormat.DOT, Color.CYAN);
		builder.addDataset("DevStop2", ChartFormat.DOT, Color.BLACK);
		builder.addDataset("DevStop3", ChartFormat.DOT, Color.RED);
		for (int i = 0; i < CHART_DATA; i++) {
			MarketAnalysis result = results.get(results.size() - CHART_DATA + i);
			builder.addValue(result.getData().getDate(), 
					result.getData().getClose(), //result.getData().getLow(), result.getData().getHigh(), 
					result.getWarn(), result.getDevStop1(), result.getDevStop2(), result.getDevStop3());
		}
		builder.output(outFile);
	}
	/**
	 * Compute the devstops and which direction they belong
	 * @param record
	 * @param vals
	 * @return
	 */
	public MarketAnalysis analyze(MarketRecord record, List<MarketAnalysis> vals) {
		MarketAnalysis result = new MarketAnalysis(record);
		//True Range
		if (vals.size() > 0) {
			MarketAnalysis last = vals.get(vals.size() - 1);
			Double tr = computeTrueRange(record.getHigh(), record.getLow(), last.getData().getClose());
			result.setTrueRange(tr);
		}
		//Moving stats
		if (vals.size() > LOOKBACK + TRUE_RANGE_BUFFER) {
			DescriptiveStatistics stats = new DescriptiveStatistics();
			DescriptiveStatistics priceStats = new DescriptiveStatistics();
			stats.addValue(result.getTrueRange());
			for (int i = 0; i < LOOKBACK; i++) {
				MarketAnalysis prev = vals.get(vals.size() - i - 1);
				stats.addValue(prev.getTrueRange());
				priceStats.addValue(prev.getData().getHigh());
				priceStats.addValue(prev.getData().getLow());
			}
			Double mean = stats.getMean();
			Double stddev1 = stats.getStandardDeviation();
			result.setTrueRangeMean(mean);
			result.setLastHigh(priceStats.getMax());
			result.setLastLow(priceStats.getMin());
			result.setTrueRangeStdDev(stddev1);
		}
		//Moving averages
		if (vals.size() > MOVING_AVG_1) {
			DescriptiveStatistics stats = new DescriptiveStatistics();
			for (int i = 0; i < MOVING_AVG_1; i++) {
				MarketAnalysis prev = vals.get(vals.size() - i - 1);
				stats.addValue(prev.getData().getClose());
			}
			result.setMovingAvg1(stats.getMean());
		}
		if (vals.size() > MOVING_AVG_2) {
			DescriptiveStatistics stats = new DescriptiveStatistics();
			for (int i = 0; i < MOVING_AVG_2; i++) {
				MarketAnalysis prev = vals.get(vals.size() - i - 1);
				stats.addValue(prev.getData().getClose());
			}
			result.setMovingAvg2(stats.getMean());
		}
		if (vals.size() > MOVING_AVG_1 && vals.size() > MOVING_AVG_2) {
			//Control flip
			if (result.getMovingAvg1() > result.getMovingAvg2()) {
				//Moving up
				result.setWarn(result.getLastHigh() - result.getTrueRangeMean());
				result.setDevStop1(result.getLastHigh() - (result.getTrueRangeMean() + (result.getTrueRangeStdDev() * 1)));
				result.setDevStop2(result.getLastHigh() - (result.getTrueRangeMean() + (result.getTrueRangeStdDev() * 2)));
				result.setDevStop3(result.getLastHigh() - (result.getTrueRangeMean() + (result.getTrueRangeStdDev() * 3)));
			} else {
				//Moving down
				result.setWarn(result.getLastLow() + result.getTrueRangeMean());
				result.setDevStop1(result.getLastLow() + (result.getTrueRangeMean() + (result.getTrueRangeStdDev() * 1)));
				result.setDevStop2(result.getLastLow() + (result.getTrueRangeMean() + (result.getTrueRangeStdDev() * 2)));
				result.setDevStop3(result.getLastLow() + (result.getTrueRangeMean() + (result.getTrueRangeStdDev() * 3)));
			}
		}
		//LOG.debug(result + "");
		return result;
	}

	public Double computeTrueRange(Double high, Double low, Double lastClose) {
		double hl = Math.abs(high - low);
		double cl = Math.abs(lastClose - low);
		double ch = Math.abs(lastClose - high);
		return Math.max(ch, Math.max(hl, cl));
	}
	
	public List<MarketRecord> parse(String dataFile) throws IOException, ParseException {
		List<MarketRecord> records = new ArrayList<MarketRecord>();
		File csvFile = new File(dataFile);
		CSVParser parser = CSVParser.parse(csvFile, StandardCharsets.UTF_8, 
				CSVFormat.RFC4180.withHeader(
						"Date",
						"Open", 
						"High",
						"Low",
						"Close", 
						"Volume",
						"Adj Close"));
		DateFormat dateFormatter = new SimpleDateFormat("yy-MM-dd");
		for (CSVRecord csvRecord : parser) {
			//Burn the header
			if (csvRecord.getRecordNumber() == 1) continue;
			String dateStr = csvRecord.get("Date");
			String openStr = csvRecord.get("Open");
			String highStr = csvRecord.get("High");
			String lowStr = csvRecord.get("Low");
			String closeStr = csvRecord.get("Close");
			
			Date d = dateFormatter.parse(dateStr);
			Double open = Double.parseDouble(openStr);
			Double high = Double.parseDouble(highStr);
			Double low = Double.parseDouble(lowStr);
			Double close = Double.parseDouble(closeStr);
			
			records.add(0, new MarketRecord(d, open, high, low, close));
		}
		return records;
	}
}

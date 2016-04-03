package Matt.StockPlot;

public class MarketAnalysis {

	private MarketRecord data;
	private Double trueRange;
	private Double trueRangeStdDev;
	private Double trueRangeMean;
	private Double lastHigh;
	private Double lastLow;
	
	private Double movingAvg1;
	private Double movingAvg2;
	
	private Double warn;
	private Double devStop1;
	private Double devStop2;
	private Double devStop3;
	
	public MarketAnalysis(MarketRecord data) {
		this.data = data;
	}

	public MarketRecord getData() {
		return data;
	}

	public void setData(MarketRecord data) {
		this.data = data;
	}

	public Double getTrueRange() {
		return trueRange;
	}

	public void setTrueRange(Double trueRange) {
		this.trueRange = trueRange;
	}

	public Double getTrueRangeStdDev() {
		return trueRangeStdDev;
	}

	public void setTrueRangeStdDev(Double trueRangeStdDev) {
		this.trueRangeStdDev = trueRangeStdDev;
	}

	public Double getTrueRangeMean() {
		return trueRangeMean;
	}

	public void setTrueRangeMean(Double trueRangeMean) {
		this.trueRangeMean = trueRangeMean;
	}
	
	public Double getLastHigh() {
		return lastHigh;
	}

	public void setLastHigh(Double lastHigh) {
		this.lastHigh = lastHigh;
	}

	public Double getLastLow() {
		return lastLow;
	}

	public void setLastLow(Double lastLow) {
		this.lastLow = lastLow;
	}
	
		public Double getMovingAvg1() {
		return movingAvg1;
	}

	public void setMovingAvg1(Double movingAvg1) {
		this.movingAvg1 = movingAvg1;
	}

	public Double getMovingAvg2() {
		return movingAvg2;
	}

	public void setMovingAvg2(Double movingAvg2) {
		this.movingAvg2 = movingAvg2;
	}

	public Double getWarn() {
		return warn;
	}

	public void setWarn(Double warn) {
		this.warn = warn;
	}

	public Double getDevStop1() {
		return devStop1;
	}

	public void setDevStop1(Double devStop1) {
		this.devStop1 = devStop1;
	}

	public Double getDevStop2() {
		return devStop2;
	}

	public void setDevStop2(Double devStop2) {
		this.devStop2 = devStop2;
	}

	public Double getDevStop3() {
		return devStop3;
	}

	public void setDevStop3(Double devStop3) {
		this.devStop3 = devStop3;
	}

	@Override
	public String toString() {
		return "MarketAnalysis [data=" + data + ", trueRange=" + trueRange + ", trueRangeStdDev=" + trueRangeStdDev
				+ ", trueRangeMean=" + trueRangeMean + ", lastHigh=" + lastHigh + ", lastLow=" + lastLow
				+ ", movingAvg1=" + movingAvg1 + ", movingAvg2=" + movingAvg2 + "]";
	}
}

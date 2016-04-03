package Matt.StockPlot;

import java.util.Date;

public class MarketRecord {
	private Date date;
	private Double open;
	private Double high;
	private Double low;
	private Double close;
	public MarketRecord(Date date, Double open, Double high, Double low, Double close) {
		super();
		this.date = date;
		this.open = open;
		this.high = high;
		this.low = low;
		this.close = close;
	}
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
	public Double getOpen() {
		return open;
	}
	public void setOpen(Double open) {
		this.open = open;
	}
	public Double getHigh() {
		return high;
	}
	public void setHigh(Double high) {
		this.high = high;
	}
	public Double getLow() {
		return low;
	}
	public void setLow(Double low) {
		this.low = low;
	}
	public Double getClose() {
		return close;
	}
	public void setClose(Double close) {
		this.close = close;
	}
	@Override
	public String toString() {
		return "MarketRecord [date=" + date + ", open=" + open + ", high=" + high + ", low=" + low + ", close=" + close
				+ "]";
	}
}

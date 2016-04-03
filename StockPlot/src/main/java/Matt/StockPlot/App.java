package Matt.StockPlot;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * Hello world!
 *
 */
public class App {
	private static ApplicationContext ctx;

	public static void main(String[] args) throws Exception {
		ctx = new AnnotationConfigApplicationContext(ApplicationConfig.class);

		MarketAnalyzer analyzer = ctx.getBean(MarketAnalyzer.class);
		analyzer.run("./table.csv");
	}
}

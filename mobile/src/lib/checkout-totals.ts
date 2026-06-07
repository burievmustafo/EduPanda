/** Web cart bilan bir xil: 10% soliq. */
export function getCheckoutTotals(priceUsd: number) {
	const subtotal = Math.max(0, priceUsd)
	const tax = subtotal * 0.1
	const total = subtotal + tax
	return { subtotal, tax, total }
}

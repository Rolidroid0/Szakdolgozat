function kevertSzámokGenerálása(n: number) {
    const numbers = Array.from({ length: n }, (_, i) => i);
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
}

export default kevertSzámokGenerálása;
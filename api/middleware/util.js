const generar_codigo = () => {
    var min = 1000;
    var max = 9999;

    return Math.floor((Math.random() * (max - min + 1)) + min);
};

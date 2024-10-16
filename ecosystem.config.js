module.exports = {
  apps: [
    {
      name: "message-managment-pocho-email-API", // Nombre de la aplicación
      script: "index.js", // Archivo de inicio de la aplicación
      watch: true, // Habilita la opción de "watch"
      ignore_watch: ["node_modules", "logs"], // Ignora cambios en la carpeta node_modules
      watch_options: {
        followSymlinks: false, // Mejora el rendimiento deshabilitando el seguimiento de enlaces simbólicos
      },
      log_file: "./logs/service.log", // Ruta del archivo de logs
      time: true, // Agrega la marca de tiempo a los logs
      restart_delay: 3000, // Retraso en milisegundos antes de reiniciar tras un fallo
      env: {
        NODE_ENV: "production", // Define variables de entorno (puedes agregar más si es necesario)
      },
      attach: true,
    },
  ],
};
 
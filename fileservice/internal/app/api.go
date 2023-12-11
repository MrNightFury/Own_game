package app

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"net/http"
)

type Application struct {
	config      Config
	fileService *FileService
}

func NewApplication(config Config) (*Application, error) {
	var mongo, err = NewDBClient(config.databaseURL)
	if err != nil {
		return nil, err
	}

	var fileService *FileService
	fileService, err = NewFileService(mongo)

	return &Application{
		config:      config,
		fileService: fileService,
	}, nil
}

func (this *Application) SetupRoutes() {
	var router = mux.NewRouter()
	router.HandleFunc("/files/ping", func(res http.ResponseWriter, req *http.Request) {
		respondWithJSON(res, http.StatusOK, "Pong")
	}).Methods("GET")

	router.HandleFunc("/files", this.getFilesList).Methods("GET")
	router.HandleFunc("/files", this.postFile).Methods("POST")
	router.HandleFunc("/files/{id}", this.getFile).Methods("GET")
	router.HandleFunc("/files/{id}/info", this.getFileInfo).Methods("GET")
	router.HandleFunc("/files/{id}", this.updateFile).Methods("PUT")
	router.HandleFunc("/files/{id}", this.deleteFile).Methods("DELETE")

	fmt.Println("Server started on databasePort :" + this.config.databasePort)
	http.ListenAndServe(":"+this.config.databasePort, router)
}

func (this *Application) postFile(res http.ResponseWriter, req *http.Request) {
	var file, header, err = req.FormFile("file")
	if err != nil {
		respondWithError(res, http.StatusBadRequest, "Cant get file header")
		return
	}
	fmt.Println(header.Filename)
	var id, e = this.fileService.saveFile(file, header.Filename)
	if e != nil {
		respondWithError(res, http.StatusInternalServerError, "Error saving file")
		return
	}
	this.postStatistics(header.Filename, 1, id.Hex())
	respondWithJSON(res, http.StatusOK, map[string]string{"id": id.Hex()})
}

func (this *Application) getFilesList(res http.ResponseWriter, req *http.Request) {
	fmt.Println("Files list get")
	var files, err = this.fileService.getFilesList()
	if err != nil {
		respondWithError(res, http.StatusNotFound, "Error getting files")
		return
	}
	respondWithJSON(res, http.StatusOK, files)
}

func (this *Application) getFile(res http.ResponseWriter, req *http.Request) {
	fmt.Println("File get")
	var id, err = primitive.ObjectIDFromHex(mux.Vars(req)["id"])
	if err != nil {
		respondWithError(res, http.StatusBadRequest, "Error parsing id")
		return
	}
	var file []byte
	file, err = this.fileService.loadFile(id)
	if err != nil {
		respondWithError(res, http.StatusBadRequest, "Error loading file: "+err.Error())
		return
	}
	var fileInfo *FileInfo
	fileInfo, err = this.fileService.getFileInformation(id)
	if err != nil {
		respondWithError(res, http.StatusBadRequest, "")
	}
	res.Header().Set("Content-Type", "application/octet-stream")
	res.Header().Set("Content-Disposition", fmt.Sprintf("filename=\"%s\"", fileInfo.Name))
	res.Write(file)
}

func (this *Application) getFileInfo(res http.ResponseWriter, req *http.Request) {
	fmt.Println("File info get")
	var id, err = primitive.ObjectIDFromHex(mux.Vars(req)["id"])
	if err != nil {
		respondWithError(res, http.StatusBadRequest, "Error parsing id")
		return
	}
	var info *FileInfo
	info, err = this.fileService.getFileInformation(id)
	if err != nil {
		respondWithError(res, http.StatusInternalServerError, err.Error())
	} else {
		respondWithJSON(res, http.StatusOK, info)
	}
}

func (this *Application) updateFile(res http.ResponseWriter, req *http.Request) {
	var file, header, err = req.FormFile("file")
	if err != nil {
		respondWithError(res, http.StatusBadRequest, "Cant get file header")
		return
	}
	var id primitive.ObjectID
	id, err = primitive.ObjectIDFromHex(mux.Vars(req)["id"])
	if err != nil {
		respondWithError(res, http.StatusBadRequest, "Error parsing id")
		return
	}
	this.fileService.deleteFile(id)
	this.postStatistics(header.Filename, 1, id.Hex())
	this.fileService.updateFile(file, header.Filename, id)
}

func (this *Application) deleteFile(res http.ResponseWriter, req *http.Request) {
	var id, err = primitive.ObjectIDFromHex(mux.Vars(req)["id"])
	if err != nil {
		respondWithError(res, http.StatusBadRequest, "Error parsing id")
		return
	}
	this.fileService.deleteFile(id)
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

func respondWithJSON(res http.ResponseWriter, code int, payload interface{}) {
	res.Header().Set("Content-Type", "application/json")
	res.WriteHeader(code)
	json.NewEncoder(res).Encode(payload)
}

func (this *Application) postStatistics(filename string, filesize int, id string) {
	if this.config.statisticsLink == "" {
		return
	}
	fmt.Println(filename, filesize, id)
	var str = fmt.Sprintf(`{"filename": "%s", "filesize": %d, "id": "%s"}`, filename, filesize, id)
	fmt.Println(str)
	var payload = []byte(str)
	var req, err = http.NewRequest("POST", this.config.statisticsLink, bytes.NewBuffer(payload))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error making request:", err)
		return
	}
	defer resp.Body.Close()
	fmt.Println("Response Status:", resp.Status)
}

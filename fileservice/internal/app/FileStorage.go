package app

import (
	"bytes"
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/gridfs"
	"log"
	"mime/multipart"
	"time"
)

type FileService struct {
	client  *mongo.Client
	storage *gridfs.Bucket
}

type FileInfo struct {
	ID   primitive.ObjectID `json:"id" bson:"_id"`
	Name string             `json:"name" bson:"name"`
	Size int64              `json:"size" bson:"size"`
}

type File struct {
	ID       primitive.ObjectID `bson:"_id"`
	Name     string             `bson:"filename"`
	Size     int64              `bson:"length"`
	UploadAt time.Time          `bson:"upload_at"`
	Path     string             `bson:"-"`
}

func NewFileService(client *mongo.Client) (*FileService, error) {
	var bucket, err = gridfs.NewBucket(client.Database("files"))
	if err != nil {
		log.Fatal("Cant create gridFS bucket")
		return nil, err
	}
	return &FileService{
		client:  client,
		storage: bucket,
	}, nil
}

func (this *FileService) saveFile(file multipart.File, filename string) (*primitive.ObjectID, error) {
	var id, err = this.storage.UploadFromStream(filename, file)
	if err != nil {
		return nil, err
	}
	return &id, nil
}

func (this *FileService) getFilesList() ([]FileInfo, error) {
	var files []FileInfo
	var cursor, err = this.storage.GetFilesCollection().Find(context.Background(), bson.D{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())
	for cursor.Next(context.Background()) {
		var file File
		err = cursor.Decode(&file)
		files = append(files, FileInfo{
			ID:   file.ID,
			Name: file.Name,
			Size: file.Size,
		})
	}
	return files, nil
}

func (this *FileService) loadFile(id primitive.ObjectID) ([]byte, error) {
	var fileStream bytes.Buffer
	var _, err = this.storage.DownloadToStream(id, &fileStream)
	if err != nil {
		return nil, err
	}
	return fileStream.Bytes(), nil
}

func (this *FileService) getFileInformation(id primitive.ObjectID) (*FileInfo, error) {
	var fileBSON = this.storage.GetFilesCollection().FindOne(context.Background(), bson.M{"_id": id})
	var file File
	var err = fileBSON.Decode(&file)
	if err != nil {
		return nil, err
	}
	return &FileInfo{
		ID:   file.ID,
		Name: file.Name,
		Size: file.Size,
	}, nil
}

func (this *FileService) updateFile(file multipart.File, filename string, id primitive.ObjectID) {
	var err = this.storage.UploadFromStreamWithID(id, filename, file)
	if err != nil {
		return
	}
}

func (this *FileService) deleteFile(id primitive.ObjectID) {
	var err = this.storage.Delete(id)
	if err != nil {
		return
	}
}

CREATE DATABASE IF NOT EXISTS appDB;
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';
GRANT SELECT, UPDATE, INSERT, DELETE, CREATE, REFERENCES ON appDB.* TO 'user'@'%';
FLUSH PRIVILEGES;

create table users if not exists (
	user_id int auto_increment,
	user_name varchar(50) not null,
	user_password varchar(50) not null,
	user_avatar_path tinytext,
	primary key (user_id)
);

create table sets if not exists (
	set_id int auto_increment,
	set_name tinytext not null,
	set_description text,
	set_author_id int,
	primary key(set_id),
	foreign key (set_author_id) references users(user_id) on update cascade on delete cascade
);

create table rounds if not exists (
	set_id int not null,
    round_number tinyint not null,
	round_name tinytext,
	primary key (set_id, round_number),
	foreign key (set_id) references sets(set_id) on update cascade on delete cascade
);

create table categories if not exists (
	category_id int auto_increment,
	category_author_id int not null,
	category_name tinytext,
	primary key (category_id),
	foreign key (category_author_id) references users(user_id) on update cascade on delete cascade
);

create table category_in_round if not exists (
	set_id int not null,
	round_number tinyint not null,
	category_id int not null,
	primary key (set_id, round_number, category_id),
	foreign key (set_id, round_number) references rounds(set_id, round_number) on update cascade on delete cascade,
	foreign key (category_id) references categories(category_id) on update cascade on delete cascade
);

create table questions if not exists (
	category_id int not null,
	question_number tinyint not null,
	question_price smallint,
	question_title tinytext,
	question_text text,
	primary key (category_id, question_number),
	foreign key (category_id) references categories(category_id) on update cascade on delete cascade
);

create table attachments if not exists (
	attachment_id int auto_increment,
	category_id int not null,
	question_number tinyint not null,
	attachment_link tinytext not null,
	attachment_type enum('image', 'audio', 'video'),
	primary key (attachment_id),
	foreign key (category_id, question_number) references questions(category_id, question_number) on update cascade on delete cascade
);

CREATE DATABASE IF NOT EXISTS own_game_db;
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';
GRANT SELECT, UPDATE, INSERT, DELETE, CREATE, REFERENCES ON own_game_db.* TO 'user'@'%';
FLUSH PRIVILEGES;

USE own_game_db;

create table users (
    user_id        int auto_increment 											primary key,
    user_login     varchar(50)                                                  not null,
    user_password  varchar(50)                                                  not null,
    user_avatar_id tinytext                                                     null,
    user_role      enum ('user', 'editor', 'moderator', 'admin') default 'user' not null,
    isBanned       tinyint(1)                                    default 0      not null
);

create table categories (
    category_id        int auto_increment
        primary key,
    category_author_id int      not null,
    category_name      tinytext null,
    constraint categories_ibfk_1
        foreign key (category_author_id) references users (user_id)
            on update cascade on delete cascade
);

create index category_author_id
    on categories (category_author_id);

create table questions
(
    category_id     int      not null,
    question_number tinyint  not null,
    question_price  smallint null,
    question_title  tinytext null,
    question_text   text     not null,
    question_answer text     not null,
    primary key (category_id, question_number),
    constraint questions_ibfk_1
        foreign key (category_id) references categories (category_id)
            on update cascade on delete cascade
);

create table attachments
(
    attachment_id   int auto_increment
        primary key,
    category_id     int                              not null,
    question_number tinyint                          not null,
    attachment_link tinytext                         not null,
    attachment_type enum ('image', 'audio', 'video') null,
    constraint attachments_ibfk_1
        foreign key (category_id, question_number) references questions (category_id, question_number)
            on update cascade on delete cascade
);

create index category_id
    on attachments (category_id, question_number);

create table sets
(
    set_id          int auto_increment
        primary key,
    set_name        tinytext not null,
    set_description text     null,
    set_author_id   int      null,
    constraint sets_ibfk_1
        foreign key (set_author_id) references users (user_id)
            on update cascade on delete cascade
);

create table rounds
(
    set_id       int      not null,
    round_number tinyint  not null,
    round_name   tinytext null,
    primary key (set_id, round_number),
    constraint rounds_ibfk_1
        foreign key (set_id) references sets (set_id)
            on update cascade on delete cascade
);

create table category_in_round
(
    set_id       int     not null,
    round_number tinyint not null,
    category_id  int     not null,
    primary key (set_id, round_number, category_id),
    constraint category_in_round_ibfk_1
        foreign key (set_id, round_number) references rounds (set_id, round_number)
            on update cascade on delete cascade,
    constraint category_in_round_ibfk_2
        foreign key (category_id) references categories (category_id)
            on update cascade on delete cascade
);

create index category_id
    on category_in_round (category_id);

create index set_author_id
    on sets (set_author_id);

create definer = root@localhost trigger insertIdCheck
    before update
    on users
    for each row
begin
        declare correctId tinytext;
        declare id int;

        if New.user_avatar_id is not null and not isCorrectFileId(New.user_avatar_id) then
            select user_avatar_id into correctId from users where user_id=New.user_id;
            set New.user_avatar_id = correctId;
        end if;
    end;

create
    definer = root@localhost function countQuestionsByCategory(categoryId int) returns int deterministic reads sql data
BEGIN
    DECLARE questionCount INT;

    SELECT COUNT(*) INTO questionCount
    FROM questions
    WHERE category_id = categoryId;

    RETURN questionCount;
END;

create
    definer = root@localhost procedure deleteQuestion(IN p_category_id int, IN p_question_number tinyint)
BEGIN
    DELETE FROM questions
    WHERE category_id = p_category_id AND question_number = p_question_number;

    UPDATE questions
    SET question_number = questions.question_number - 1
    WHERE category_id = p_category_id AND questions.question_number > p_question_number;
END;

create
    definer = root@localhost procedure deleteRound(IN p_set_id int, IN p_round_number tinyint)
BEGIN
    DELETE FROM rounds
    WHERE set_id = p_set_id AND round_number = p_round_number;

    UPDATE rounds
    SET round_number = round_number - 1
    WHERE set_id = p_set_id AND round_number > p_round_number;
END;

create
    definer = root@localhost procedure getRoundsCount()
begin
select user_id, count(*) from
users inner join sets on sets.set_author_id=users.user_id
inner join rounds on sets.set_id=rounds.set_id
group by set_author_id;
end;

create
    definer = root@localhost function isCorrectFileId(path tinytext) returns tinyint(1) deterministic
begin
return case when path regexp '^[0-9a-f]{24}$' then true else false end;
end;

create
    definer = root@localhost procedure swapQuestions(IN p_category_id int, IN p_question_number tinyint)
BEGIN
    DECLARE next_question_number TINYINT;

    SELECT question_number INTO next_question_number
    FROM questions
    WHERE category_id = p_category_id AND question_number = p_question_number + 1;

    IF next_question_number IS NOT NULL THEN
        UPDATE questions SET question_number = -1
        WHERE category_id = p_category_id AND question_number = p_question_number;

        UPDATE questions SET question_number = p_question_number
        WHERE category_id = p_category_id AND question_number = next_question_number;

        UPDATE questions SET question_number = next_question_number
        WHERE category_id = p_category_id AND question_number = -1;
    END IF;
END;

